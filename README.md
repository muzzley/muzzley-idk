# Muzzley IDK

This package gives you the right tool belt to build managers that runs in Muzzley ecosystem.

##### Pst! Pst! IDK stands for Integration Development Kit

## Installation

To install just run the following command in your terminal

```bash
npm i muzzley-idk --save
```

We recommend you, to use our yeoman generator to generate the boilerplate needed to build a manager, go take a peek [here](https://github.com/muzzley/generator-muzzley-manager) 

## What is under the hood?
This tool belt brings 2 important logic components to ease your pain, those are `Helpers` and `Plugins`

## Helpers
Helper are classes that can be instantiate and do some business logic

Currently there are the following helpers

### Api
This helpers let you access our Api endpoints easily, abstracting and removing unnecessary patterns, like for e.g. endpoint authentication, each time you try to access.

For more information about this endpoints, please read [Muzzley Api Documentation](https://www.muzzley.com/documentation/integration/muzzley-api.html#api_endpoints) 

#### Methods

#### `post(channelId, posts, callback)`

#### `summary(channelId, content, callback)`

#### `revoke(channelId, content, callback)`


#### Example usage
```javascript
  var config = require('config');
  var Api = require('muzzley-idk').helpers.Api;

  var api = new Api(config.muzzley.api.credentials.id, config.muzzley.api.credentials.key);

  // Post method
  api.post(channelId, [{
    content: 'Muzzley is awesome',
    photoUrl: 'http://https://muzzley.com/documentation/img/Logo.png'
  }], function (err) {
      ...
  }); 
```

### Logger

This is basically node-bunyan logger wrapped

For more information, please see [node-bunyan repository](https://github.com/trentm/node-bunyan)

#### Example usage
```javascript
  var config = require('config');
  var Logger = require('muzzley-idk').helpers.Logger;
  
  var log = Logger(config.bunyan);
  
  log.debug('Just debugging');
```

### Storage

This is a Storage helper 

(Need cooler explanation and how to use)

#### Example usage

```javascript
    var storage = require('muzzley-idk').helpers.Storage.getDefault();
    
    storage.client().get('key', function (err, result) {
      ...
    });
```

## Plugins
*"Plugins are solated pieces of business logic, and reusable utilities, used in hapi."*, Read more [here](http://hapijs.com/tutorials/plugins)

We have the following *pre cooked* plugins, inside our IDK, you just need to extend them.

Some plugins are mandatory to be used, if you don't use them the manager will **not work**, those plugins are marked with a *

To use them you need to require and register them to your server.

We suggest you to wrap the plugins inside an array of objects and register them with `async`, for e.g. like this

```javascript
// Plugins objects
var authPlugin = require('./auth');
var channelsPlugin = require('./channels');
var subscriptionsPlugin = require('./subscriptions');
var imagesPlugin = require('./images');

var plugins = [
  authPlugin,
  channelsPlugin,
  subscriptionsPlugin,
  imagesPlugin
];

async.eachSeries(plugins, function (plugin, cb) {
  server.pack.register(plugin.plugin, plugin.options || {}, function (err) {
    return cb(err);
  });
}, function (err) {
  // If err is null, plugins registry was successful
});
```

Now lets get more in-depth on how to use and extend our *pre cooked* plugins, when we are extending plugins from the Muzzley IDK
 we normally split the logic of the plugin in 2 files, `index.js` and `handlers.js`, inside a directory with the name of the plugin,
 you can see some code examples in [`samples/plugins`](samples/plugins)

### Auth* 

The `auth` plugin has two purposes, render the authentication page and
the authorization page.

By default the authentication urls are mounted on the root of the server if you want to mount them on another base path, 
you can pass the `options.route.prefix` to mount in another base path, you can see that being done in [`samples/plugins/auth/index.js`](samples/plugins/auth/index.js)

#### Options
The `auth` plugin needs the following object to work properly. Some
properties are optional others don't :).

- `url` - A required property that indicates the url where the authentication page
  can be found (ex: 'http://domain/').

- `auth` - This property configure the behaviour of the authentication
  component.

    - `title` - The string on the top navbar.

    - `subtitle` - The header above the form.

    - `label` - The value of the form submit button.

    - `inputs` - How many inputs do you want on your form? The
        properties of the `inputs` property will be rendered as inputs
        based on configuration. This is an object where the keys are the
        id and the value is an object with the folowing possible keys.

        - `type` - Optional defaults to `text`. Do you have a
            password? Use `password`.

        - `label` - Optional defaults to empty. Use this if you want
            your input to be more descritive.

        - `placeholder` - Optional defaults to empty. A label isn't
            enough, use the placeholder to add more details to the
            input.

    - `config` - This object is comparable with the config property of the route options [object]().

        To notify the user that something went bad the manager should call the reply with a bad request error (`reply(Boom.badRequest('username or password invalid'))`).
        To redirect the user to the authorization page the request has an the helper function `redirectToAuthorization` to does all the heavy lifting.

- `authz` - This property configure the behavior of the authorization
    component.

    - `title` - The string on the top navbar.

    - `permissions` - It's always important to tell your users what
        will they give access to.

        - `available` - An array with string indicating what the third
            party can access if the user allow the authorization.

        - `unavailable` - An array with string indicating the
            resources that will be out of reach to the third party.

    - `config` - This object is comparable with the config property of the route options [object]().

    When a post is made to authenticate the user the handler is called with the [request][] and [reply][] from [Hapi][]. The user choice is available in the request payload (`request.payload.choice`) and can have one of two values `permit` or `cancel`.

This plugin exposes the following endpoints:

* / - The root endpoint where the authentication url can be obtained.

* /authentication - The authentication endpoint. An HTML page is returned.

* /authorization - The authorization endpoint. An HTML page is returned.


### Channels*

The `channels` plugin abstract the list of channels of
a given user endpoint.

#### Options

The `channels` plugin needs the following object to work properly.

-   `config` - This object is comparable with the config property of the route options [object]().

```javascript
config: {
  handler: function (request, reply) {
    var user = request.params.user;
    // handle errors and invalid user
    return reply(users[user].channels);
  }
}
```

### Subscriptions*

The `subscriptions` plugin has two purposes, provide the list of channels of
a given user or provide the information of a specific channel of a given
user.

#### Options

The `subscriptions` plugin needs the following object to work properly.

-   `config` - This object is comparable with the config property of the route options [object]().

```javascript
config: {
  handler: function (request, reply) {
    var user = request.params.user;
    // handle errors and invalid user
    return reply(users[user].channels);
  }
}
```

#### Reply Payload

The channels reply should be an array of channels such as this:

```javascript
    [
      {
        "id": 1234567,
        "content": "Channel Name",
        "activity":"<muzzley interaction activity id>"
      },
      { ... }
    ]
```


### Images*
This plugin expose an image directory, inside your project directory to the web server, so it can be accessed through http, normally, should be something like `public/images/` 

After you register the plugin you can access the directory from `http://[hostname:port]/images/`


#### Options

The `images` plugin needs the following object to work properly.

-   `config` - This object is comparable with the config property of the route options [object]().

```javascript
config: {
  handler: function (request, reply) {
    var user = request.params.user;
    // handle errors and invalid user
    return reply(users[user].channels);
  }
}
```


### Discovery

The `discovery` plugin let you discover local devices through UPNP




[Hapi]: https://github.com/spumko/hapi/blob/master/docs/Reference.md
[request]: https://github.com/spumko/hapi/blob/master/docs/Reference.md#request-object
[reply]: https://github.com/spumko/hapi/blob/master/docs/Reference.md#reply-interface
[Hawk]: https://github.com/hueniverse/hawk
[object]: http://hapijs.com/api#route-options
[options]: http://hapijs.com/api#packregisterplugins-options-callback