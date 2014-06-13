# Template for the Perfect SPA
This is a boilerplate to be used when you want to create a single page application with angular.js.

## Building blocks
The perfect stack template consists of:
* Grunt
* Bower
* Angular.js

### Prerequisites
* node.js and npm (installation depends on platform)
* npm install -g grunt-cli
* npm install -g bower

### Installation
* git clone https://github.com/CaptainJiNX/perfect-stack-template
* npm install
* bower install
* npm run dev - will start the app in dev mode without minification and stuff
* npm start - will start the app in production mode
* npm test - will run all jasmine test with Karma

### Directory Layout
    src/
            app/              	=> Application root
              app.js         	=> Application container module
              index.html     	=> Index page 
              shell/
                controllers/	
            	  shell-controller.js => Simple example controller for the Shell module
            	shell-module.js => Simple example module
            	specs/
            	  shell-controller.spec.js => Jasmine specifications for the controller

## Strengths
* This stack is very easy to build upon, because all the plumming is taken care of with grunt.

## Weaknesses
* Are you kidding me? ;)

## Possible improvements and extensions
* Adding folder structure for directives, services etc.
* Create docker.io image for this