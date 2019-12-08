var ws281x = require('rpi-ws281x-native');
var convert = require('color-convert');
var Service, Characteristic;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerAccessory('homebridge-neo-strip', 'Neo-Devices', neoStrip);
}

function neoStrip(log, config) {

  this.log = log;
  this.name = config['name'];
  //this.gpio_pin = config['gpio_pin'];
  this.num_leds = config['number_of_leds'];

  this.Brightness = 0;
  this.On = 0;
  this.Saturation = 0;
  this.Hue = 0;

  this.pixelData = new Uint32Array(this.num_leds);
  ws281x.init(this.num_leds);

  this.log("++ Initialized '" + this.name + "'");

  this.service = new Service.Lightbulb(this.name);

  this.infoService = new Service.AccessoryInformation();
  this.infoService
    .setCharacteristic(Characteristic.Manufacturer, 'Gunnar Bjorkman')
    .setCharacteristic(Characteristic.Model, 'HomeKit RPi NeoPixel')
    .setCharacteristic(Characteristic.SerialNumber, 'Version 0.0.1');
}

neoStrip.prototype.setColor = function() {

  var color = convert.hsv.rgb(this.Hue, this.Saturation, this.Brightness);

  //this.log(color[0]);

  if (!this.On) {
    ws281x.reset();
  }

  for (var i = 0; i < this.num_leds; i++) {
    pixelData[i] = rgb2Int(color);
  }

  ws281x.render(this.pixelData);
};

neoStrip.prototype.getServices = function() {
  var lightbulbService = new Service.Lightbulb(this.name);
  var bulb = this;

  lightbulbService
    .getCharacteristic(Characteristic.On)
    .on('get', function(callback) {
      callback(null, bulb.On);
    })
    .on('set', function(value, callback) {
      bulb.On = value;
      bulb.log("power to " + value);
      bulb.setColor();
      callback();
    });

  lightbulbService
    .addCharacteristic(Characteristic.Brightness)
    .on('get', function(callback) {
      callback(null, bulb.Brightness);
    })
    .on('set', function(value, callback) {
      bulb.Brightness = value;
      bulb.log("brightness to " + value);
      bulb.setColor();
      callback();
    });

  lightbulbService
    .addCharacteristic(Characteristic.Hue)
    .on('get', function(callback) {
      callback(null, bulb.Hue);
    })
    .on('set', function(value, callback) {
      bulb.Hue = value;
      bulb.log("hue to " + value);
      bulb.setColor();
      callback();
    });

  lightbulbService
    .addCharacteristic(Characteristic.Saturation)
    .on('get', function(callback) {
      callback(null, bulb.Saturation);
    })
    .on('set', function(value, callback) {
      bulb.Saturation = value;
      bulb.log("saturation to " + value);
      bulb.setColor();
      callback();
    });

  return [lightbulbService];
};

function rgb2Int(r, g, b) {
  return ((r & 0xff) << 16) + ((g & 0xff) < 8) + (b & 0xff);
}
