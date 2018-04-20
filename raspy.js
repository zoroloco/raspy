var pathUtil = require('path'),
    log      = require(pathUtil.join(__dirname,'./logger.js')),
    cp       = require('child_process'),
    _        = require('underscore');


ELBOW = 0;
HEAD_PAN = 1;
HEAD_TILT = 3;
SHOULDER = 4;
BASE = 5;
HAND = 6;
WRIST = 7;

function Raspy(){
    var self      = this;
    this._cmd     = pathUtil.join(__dirname,"raspibot.py");
    this._maestro = null;

    Raspy.prototype.shutdown = function(){
        var self = this;
        if(!_.isEmpty(self._maestro)){
            process.kill(self._maestro.pid);//clean-up python serial connection
        }
    };

    Raspy.prototype.connect = function() {
        var self = this;
        self._maestro = cp.spawn('python', [self._cmd]);
        self._maestro.stdin.setEncoding('utf-8');

        self._maestro.stdout.on('data', (data) => {
            log.info('raspy received stdout from maestro:'+data.toString());
            if(_.isEqual(data.toString(),'CONNECTED')){
                log.info("Successfully started raspibot.py script.");
                //self.wakeUp();
            }
        });

        self._maestro.stderr.on('data', (err) => {
            log.error('raspy received stderr from maestro:'+err);
        });

        self._maestro.on('close', (code) => {
            log.info('raspy python process closed with code:'+code);
        });

        self._maestro.on('exit', (code) => {
            log.info('raspy python process exited with code:'+code);
        });
    };

    Raspy.prototype.wakeUp = function(){
        var self = this;

        self.sendCommand({"servo":HEAD_TILT,"pos":9000});//get head out of arm's way
        self.sendCommand({"servo":BASE,"pos":5833});
        self.sendCommand({"servo":SHOULDER,"pos":3000});
        self.sendCommand({"servo":ELBOW,"pos":9000});
        self.sendCommand({"servo":WRIST,"pos":9000});
        self.sendCommand({"servo":HAND,"pos":9000});//hand open
        self.sendCommand({"servo":HEAD_PAN,"pos":5500});//center head
        self.sendCommand({"servo":HEAD_TILT,"pos":6000});//put head up
    };

    Raspy.prototype.sendCommand = function(cmd){
        var self = this;
        log.info("Raspy got command:" + JSON.stringify(cmd));
        if (!_.isEmpty(self._maestro)) {
            log.warn('Sending command down to stdin of maestro.');
            self._maestro.stdin.write(cmd.servo+","+cmd.pos+'\r\n');//just send down raw
        }
        else {
            log.error("Raspy error. Maestro object null.");
        }
    }
}//Raspy

module.exports = Raspy;