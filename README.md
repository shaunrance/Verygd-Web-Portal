# very.gd

## Getting Started

Setting up this project is easy!
To do it, follow these steps in **this order**:

1. [Install node modules and linters](#install-node-modules)
2. [Install pre-commit](#install-pre-commit)
3. [Install bower components](#install-bower-components)
4. [Setup local environment config](#setup-local-environment-config)
5. [Run Grunt](#run-grunt)

### Install node modules and linters

```
npm install
```

Among other things, this will force the Use All Five coding style guides for JavaScript and SCSS.

To ensure the latter, [install](https://packagecontrol.io/installation) the following packages for Sublime Text (or similiar IDE):

- EditorConfig
- SublimeLinter
- SublimeLinter-jscs
- SublimeLinter-jshint
- SublimeLinter-contrib-scss-lint

### Install pre-commit

1. Install Pre-Commit, follow [these installation instructions](http://pre-commit.com/#install).
2. Run:
```
pre-commit install
```

This should install the following pre-commit linters:
- scss-lint
- jshint
- jscs

### Install bower components

```
bower install
```

### Setup local environment config
Create a `secret.yml` and update with sample info:
```
secret:
    staging:
        path: '/path/to/site/'
        host: ua5.land
        username:
        password:
    prod:
        path: '/'
        host: 
        username: 
    port: 8082
```

Feel free to change the port to your liking, and also obtain push access from a fellow Fiver. Feel free to leave staging information blank.

### Run Grunt
Our grunt watch task does a handful of things, such as livereload, serve the site, etc. You’ll need to run it while you work on the site.

```
grunt
```

---

## Frontend E2E Testing

### Setup
```
brew install selenium-server-standalone
npm install -g protractor
webdriver-manager update
```

### 
Run the Selenium server: `webdriver-manager start`
Run the grunt test task: `grunt test`


## Deployments

### Make a Build & Test

You’ll want to do a build to make sure all the dependencies load correctly. This will essentially be what gets deployed.

```
grunt build
```

#### To Deploy to Staging

To push to staging, run:
```
grunt stage
```

# Backend

## Setup

This assumes you have python installed already.

### Install virtualenv

```
[sudo] pip install virtualenv
```

### Create a virtualenv

Name a new virtualenv directory ('verygd' in this example).
```
virtualenv ~/verygd
```
Activate it.
```
source ~/verygd/bin/activate
```
Keep this virtualenv active for subsequent steps, and in general before running any project-related commands.

### Install Project Dependencies 

Change to the project directory and run

```pip install -r requirements.txt```

May need to install django
`sudo pip install django --upgrade `

### Local Setup
- Get a django key at http://www.miniwebtool.com/django-secret-key-generator/
- Edit your ~/.bash_profile:

```
export DEV_ENV=True
export DJANGO_SECRET_KEY='YOUR KEY'

```
Run `source ~/.bash_profile`

- Create a database, perhaps use MAMP
- Edit `/etc/mysql.cnf` with your verygd db info:
```
[client]
database = verygd
host = localhost
user = root
password = root
default-character-set = utf8
socket = /Applications/MAMP/tmp/mysql/mysql.sock
```

- Run the server
`python manage.py runserver`

## Deployment

Obtain the very.gd pem file and securely copy the file to your `~/.ssh` directory.

Assuming your `ssh-agent` is active, `ssh-add` the very.gd pem file to your `ssh-agent`.

To deploy the latest from the `deployment` branch, you'll need to run the deployment fabric command.

`fab -R staging deploy -u ubuntu`
