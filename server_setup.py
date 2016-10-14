from fabric.contrib import files
from fabric.api import env
from fabric.context_managers import cd
from fabric.operations import run, sudo

# assume fabric command is ran one role at a time, could use task params here instead
env_dir = env.roles[0]
sys_files_dir = 'system'


def checkout_repo(in_dir):
    print('cloning repo..\n')
    sudo('git clone git@github.com:verygd/Verygd-Web-Portal.git {0}'.format(in_dir))


def setup_working_dir(working_dir_name):
    print('creating working directory ({0})\n'.format(working_dir_name))

    sudo('mkdir -p {0}'.format(working_dir_name))

    with cd(working_dir_name):
        checkout_repo(env_dir)


def copy(repo_conf, system_file):
    if not has_file(system_file):
        print('{repo_conf} -> {system_file}'.format(repo_conf=repo_conf, system_file=system_file))

        sudo('cp {repo_conf} {system_file}'.format(repo_conf=repo_conf, system_file=system_file))


def repo_config_path(working_dir, path):
    return '/'.join([working_dir, sys_files_dir, path])


def create_tmp_socket(named):
    socket = '/tmp/{name}'.format(name=named)
    sudo('touch ' + socket)
    sudo('chmod 600 ' + socket)


def setup_supervisord(*args, **kwargs):
    print('setting up supervisord..\n')

    sudo('pip install supervisor')

    create_tmp_socket('supervisor.sock')

    copy(repo_config_path(kwargs['working_dir'], 'supervisord.conf'), '/etc/supervisord.conf')


def run_supervisord():
    if has_file('/tmp/supervisord.pid'):
        sudo('kill -HUP `cat /tmp/supervisord.pid`')
    sudo('supervisord -c /etc/supervisord.conf')


def setup_nginx(*args, **kwargs):
    print('setting up nginx..\n')

    nginx_log_dir = '/var/local/nginx/log/'

    sudo('apt-get install nginx')

    if not has_file(nginx_log_dir):
        sudo('mkdir -p {0}'.format(nginx_log_dir))

    conf_dir = '/etc/nginx/sites-available/very.gd/{0}'.format(env_dir)

    sudo('mkdir -p {0}'.format(conf_dir))

    copy(repo_config_path(kwargs['working_dir'], 'nginx.conf'), '/'.join([conf_dir, 'nginx.conf']))


def setup_uwsgi_params(filename='/var/local/uwsgi/uwsgi_params', *args, **kwargs):
    if not has_file(filename):
        copy(repo_config_path(kwargs['working_dir'], 'uwsgi_params'), filename)


def setup_uwsgi(*args, **kwargs):
    print('setting up uwsgi..\n')

    setup_uwsgi_params(**kwargs)

    conf_dir = '/etc/uwsgi/sites/python3/very.gd/{0}'.format(env_dir)
    log_dir = '/var/local/uwsgi/log/'

    sudo('TMPDIR=/tmp pip install uwsgi'.format(venv_dir=kwargs['venv_dir']))

    create_tmp_socket('very_gd_{0}_uwsgi.sock'.format(env_dir))

    if not has_file(conf_dir):
        sudo('mkdir -p {0}'.format(conf_dir))

    if not has_file(log_dir):
        sudo('mkdir -p {0}'.format(log_dir))

    # this is needed for python3
    copy(repo_config_path(kwargs['working_dir'], 'spawn_python3.ini'), '/'.join([conf_dir, 'uwsgi.ini']))

    # copy main uwsgi file
    copy(repo_config_path(kwargs['working_dir'], '{0}/uwsgi.ini'.format(env_dir)),
         '/'.join(['/etc/uwsgi/sites', 'uwsgi.ini']))


def setup_virtualenv(*args, **kwargs):
    print('setting up virtualenv..\n')

    sudo('mkdir -p {0}'.format(kwargs['venv_dir']))
    sudo('pip install --upgrade virtualenv')
    sudo('virtualenv -p python3 {0}'.format(kwargs['venv_dir']))


def has_file(named):
    if not files.exists(named):
        return False
    else:
        return True


def has_nginx():
    return has_file('/usr/bin/nginx')


def has_supervisord():
    return has_file('/usr/bin/supervisord')


def has_uwsgi():
    uwsgi_env_file = '/etc/uwsgi/very.gd.{0}.env'.format(env_dir)

    if not has_file(uwsgi_env_file):
        raise Exception('no env file present for uwsgi! ({0})'.format(uwsgi_env_file))

    return has_file('/usr/bin/uwsgi')


def has_virtualenv(venv_dir):
    return has_file(venv_dir)


def initial_install(*args, **kwargs):
    print('checking for existing setup..\n')

    sudo('apt-get update')
    sudo('apt-get install python3-dev')

    if not has_file(kwargs['working_dir']):
        setup_working_dir(**kwargs)

    if not has_virtualenv(kwargs['venv_dir']):
        setup_virtualenv(**kwargs)

    setup_uwsgi(**kwargs)

    setup_nginx(**kwargs)

    setup_supervisord(**kwargs)

    run_supervisord()
