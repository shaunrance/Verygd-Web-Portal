from fabric.api import env
from fabric.context_managers import cd
from fabric.operations import run

from server_setup import initial_install as init


working_dir = '/var/local/very.gd'
remove_venv = '/'.join([working_dir, '../verygd_venv'])

env.roledefs = {
    'staging': ['ec2-52-53-186-20.us-west-1.compute.amazonaws.com']
}


def update_files():
    run('git pull -r')


def install_upgrade_reqs():
    run('source {venv_dir}/bin/activate && pip install -r requirements.txt --upgrade'.format(venv_dir=remove_venv))


def restart_uwsgi():
    run('uwsgi --reload /tmp/uwsgi.pid')


def run_migrations():
    run('source {venv_dir}/bin/activate && ./manage.py migrate'.format(venv_dir=remove_venv))


def setup():
    update_files()
    install_upgrade_reqs()
    run_migrations()
    restart_uwsgi()


def initial_install():
    return init(venv_dir=remove_venv, working_dir=working_dir)


def deploy():
    print('deploying..')

    with cd(working_dir):
        setup()
