var convict = require('convict');

var c = convict({
  env: {
    doc: 'The environment the app is run against.',
    format: ['production', 'staging', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  redis: {
    host: {
      doc: 'The host where the redis server is available.',
      format: String,
      default: 'localhost',
      env: 'REDIS_SERVER_HOST'
    },
    port: {
      doc: 'The port where the redis server is available.',
      format: Number,
      default: 6379,
      env: 'REDIS_SERVER_PORT'
    }
  },
  muzzley: {
    url: {
      protocol: {
        doc: 'The protocol where the muzzley api is available.',
        format: ['http', 'https'],
        default: 'http',
        env: 'API_MUZZLEY_PROTOCOL'
      },
      host: {
        doc: 'The host where the muzzley api is available.',
        format: String,
        default: 'channels.muzzley.com',
        env: 'API_MUZZLEY_HOST'
      },
      port: {
        doc: 'The port where the muzzley api is available.',
        format: Number,
        default: 80,
        env: 'API_MUZZLEY_PORT'
      }
    }
  },
  logger: {
    doc: 'The bunyan logger configuration.',
    format: Object,
    default: {
      name: require('../package.json').name
    }
  }
});

var env = c.get('env');
var path = [__dirname, 'environments', env].join('/');
try {
  var alternative = require(path);
  c.load(JSON.parse(JSON.stringify(alternative)));
} catch (e) {}

c.validate();
exports = module.exports = c;
