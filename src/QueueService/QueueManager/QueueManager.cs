﻿using System;
using System.Collections.Generic;
using System.Fabric;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.ServiceFabric.Data.Collections;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;

namespace QueueManager
{
    using System.Diagnostics;

    /// <summary>
    /// An instance of this class is created for each service replica by the Service Fabric runtime.
    /// </summary>
    internal sealed class QueueManager : StatefulService
    {
        private const string QueueNameFormat = "fabric:/{0}";

        private readonly string serviceUrl;

        public QueueManager(StatefulServiceContext context)
            : base(context)
        {
            Debugger.Launch();
            var temp = context.CodePackageActivationContext.GetEndpoint("ServiceEndpoint");
            Console.WriteLine(temp);
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
            return new ServiceReplicaListener[0];
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

        private async Task GetOrCreateQueue(string queueName)
        {
            var ret = await this.StateManager.GetOrAddAsync<IReliableConcurrentQueue<string>>(new Uri(string.Format(QueueNameFormat, queueName)));

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
    }
}
