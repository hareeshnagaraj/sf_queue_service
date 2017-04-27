using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace QueueManager.Controllers
{
    [Route("queuemanager/[controller]")]
    class QueueController : Controller
    {
        [HttpPost("getorcreatequeue/{name}")]
        public string GetOrCreateQueue(string name)
        {
            return "test";
        }
    }
}
