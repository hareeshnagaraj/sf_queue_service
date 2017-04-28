using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace QueueManager.Controllers
{
    class QueueManagerController : Controller
    {
        [Route("api/get")]
        [HttpGet]
        public string Get()
        {
            return "test";
        }
    }
}
