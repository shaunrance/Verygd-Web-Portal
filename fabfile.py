from fabric.api import env
from fabric.context_managers import cd
from fabric.operations import run, sudo

from server_setup import initial_install as init

env_dir = env.roles[0]
working_dir = '/var/local/very.gd/{0}'.format(env_dir)
remote_venv = '/var/local/very.gd/venvs/{0}'.format(env_dir)

env.roledefs = {
    'staging': ['ec2-52-53-186-20.us-west-1.compute.amazonaws.com']
}


def update_files():
    run('git pull -r')


def install_upgrade_reqs():
    run('source {venv_dir}/bin/activate && pip install -r requirements.txt --upgrade'.format(venv_dir=remote_venv))


def restart_uwsgi():
    sudo('uwsgi --reload /tmp/uwsgi.pid')


def run_migrations():
    export_secret_env = 'for i in `cat /etc/uwsgi/very.gd.staging.env`; do export $i; done'

    run('{export_env} && source {venv_dir}/bin/activate && ./manage.py migrate'.format(
        venv_dir=remote_venv,
        export_env=export_secret_env
    ))


def setup():
    update_files()
    install_upgrade_reqs()
    run_migrations()
    restart_uwsgi()


def initial_install():
    return init(venv_dir=remote_venv, working_dir=working_dir)


def deploy():
    print('deploying..')

    with cd(working_dir):
        setup()
