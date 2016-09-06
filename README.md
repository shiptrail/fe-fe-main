Typescrip - Angular - Gulp Prototype
------------------------------------

### Init

1. Install NodeJs
3. Use the following commands in the directory:
    - `npm install`

### Development

- Use `npm start` to start a local server
- Use `npm run test` to start tests
- Use `npm run build` to build the project

### Deployment

If you would like to deploy this application note that there is a
env.js file in the assets directory. This file will be loaded by the
browser before the angular app is initialized. The file contains a few
urls which point to a backend API. Changing this configuration is as simple
as placing a new env.js file into the asset directory. The file can
and should be (re)placed there after the angular app is built (e.g.
'gulp build'). 

### Links

- https://www.typescriptlang.org/
- https://angularjs.org/
- https://github.com/tombatossals/angular-openlayers-directive
- http://tombatossals.github.io/angular-leaflet-directive/#!/getting-started
