using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace QueueManager.Controllers
{
    [Route("[controller]/[action]")]
    class QueueManagerController : Controller
    {
        [HttpPost("{name}")]
        public string GetOrCreate(string name)
        {
            return "test";
        }
    }
}
