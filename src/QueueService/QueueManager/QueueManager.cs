using System;
using System.Collections.Generic;
using System.Fabric;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.ServiceFabric.Data.Collections;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using Microsoft.ServiceFabric.Data;
using System.Collections.Concurrent;

namespace QueueManager
{
    /// <summary>
    /// An instance of this class is created for each service replica by the Service Fabric runtime.
    /// </summary>
    internal sealed class QueueManager : StatefulService
    {
        private const string QueueNameFormat = "fabric:/{0}";

        private readonly string serviceUrl;

        private readonly string fullUrl;

        private ConcurrentDictionary<Guid, ITransaction> txnDictionary; 

        public QueueManager(StatefulServiceContext context)
            : base(context)
        {
            this.fullUrl = string.Format(
                "http://{0}:{1}{2}",
                context.NodeContext.IPAddressOrFQDN,
                context.CodePackageActivationContext.GetEndpoint("ServiceEndpoint").Port,
                context.ServiceName.AbsolutePath);

            ServiceEventSource.Current.Message(this.fullUrl);
        }

        /// <summary>
        /// Optional override to create listeners (e.g., HTTP, Service Remoting, WCF, etc.) for this service replica to handle client or user requests.
        /// </summary>
        /// <remarks>
        /// For more information on service communication, see https://aka.ms/servicefabricservicecommunication
        /// </remarks>
        /// <returns>A collection of listeners.</returns>
        protected override IEnumerable<ServiceReplicaListener> CreateServiceReplicaListeners()
        {
            return new ServiceReplicaListener[]
            {
                new ServiceReplicaListener(serviceContext =>
                    new KestrelCommunicationListener(serviceContext, "ServiceEndpoint", (url, listener) =>
                    {
                        return new WebHostBuilder()
                            .UseKestrel()
                            .ConfigureServices(
                                services => services
                                    .AddSingleton<StatefulServiceContext>(serviceContext)
                                    .AddSingleton<IReliableStateManager>(this.StateManager))
                            //.UseContentRoot(Directory.GetCurrentDirectory())
                            .UseStartup<WebStartup>()
                            .UseServiceFabricIntegration(listener, ServiceFabricIntegrationOptions.UseUniqueServiceUrl)
                            .UseUrls(url)
                            .Build();
                    }))
            };
        }

        /// <summary>
        /// This is the main entry point for your service replica.
        /// This method executes when this replica of your service becomes primary and has write status.
        /// </summary>
        /// <param name="cancellationToken">Canceled when Service Fabric needs to shut down this service replica.</param>
        protected override async Task RunAsync(CancellationToken cancellationToken)
        {
            await Task.Delay(TimeSpan.FromMilliseconds(-1), cancellationToken);
        }

        private async Task<string> GetOrCreateQueue(string queueName)
        {
            await this.StateManager.GetOrAddAsync<IReliableConcurrentQueue<string>>(new Uri(string.Format(QueueNameFormat, queueName)));
            return this.fullUrl + "/" + queueName;
        }

        private async Task DeleteQueue(string queueName)
        {
            var ret = await this.StateManager.TryGetAsync<IReliableConcurrentQueue<string>>(new Uri(string.Format(QueueNameFormat, queueName)));

            if (!ret.HasValue)
            {
                throw new FabricException(string.Format("Queue with name {0} not found", queueName));
            }

            await this.StateManager.RemoveAsync(new Uri(string.Format(QueueNameFormat, queueName)));
        }

        private async Task Enqueue(string value, string queueName)
        {
            var ret = await this.StateManager.TryGetAsync<IReliableConcurrentQueue<string>>(new Uri(string.Format(QueueNameFormat, queueName)));

            if (!ret.HasValue)
            {
                throw new FabricException(string.Format("Queue with name {0} not found", queueName));
            }

            using (var tx = this.StateManager.CreateTransaction())
            {
                await ret.Value.EnqueueAsync(tx, value).ConfigureAwait(false);
                await tx.CommitAsync().ConfigureAwait(false);
            }
        }

        private async Task<Tuple<Guid, string>> TryDequeueAsync(string queueName, int visibilityTimeout)
        {
            var ret = await this.StateManager.TryGetAsync<IReliableConcurrentQueue<string>>(new Uri(string.Format(QueueNameFormat, queueName)));

            if (!ret.HasValue)
            {
                throw new FabricException(string.Format("Queue with name {0} was not found", queueName));
            }

            var tx = this.StateManager.CreateTransaction();
            ConditionalValue<string> dequeuedValue = await ret.Value.TryDequeueAsync(tx).ConfigureAwait(false);

            if (dequeuedValue.HasValue)
            {
                var guid = Guid.NewGuid();

                var added = this.txnDictionary.TryAdd(guid, tx);
                if (added)
                {
                    var t = this.StartVisibilityTimer(guid, visibilityTimeout);
                    return new Tuple<Guid, string>(guid, dequeuedValue.Value);
                }
                else
                {
                    throw new InvalidOperationException("Operation failed as the token could not be added. Retry dequeue");
                }
            }
            else
            {
                return new Tuple<Guid, string>(Guid.Empty, string.Empty);
            }
        }

        private async Task CompleteDequeueAsync(Guid token)
        {
            if (token == Guid.Empty)
            {
                // Nothing to do
                return;
            }

            ITransaction txn;
            var removed = this.txnDictionary.TryRemove(token, out txn);

            if (removed)
            {
                await txn.CommitAsync().ConfigureAwait(false);
            }
            else
            {
                throw new InvalidOperationException(
                    string.Format(
                        "Complete could not be completed as the token {0} could not be found. The dequeue did not complete succesfully.",
                        token));
            }
        }

        private async Task StartVisibilityTimer(Guid token, int visibilityTime)
        {
            await Task.Delay(visibilityTime);

            ITransaction temp;

            // When the timer expires, remove the token from the dictionary. 
            // If the remove was unsuccesful, then Complete was already called for this token, ignore the remove
            // If it was succesfully removed, then the Complete call would fail to find the token.
            this.txnDictionary.TryRemove(token, out temp);
        }
    }
}
