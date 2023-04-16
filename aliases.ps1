function DockerComposeUp { docker-compose build }
Set-Alias dbd DockerComposeUp

function DockerComposeUp { docker-compose up }
Set-Alias dup DockerComposeUp

function DockerComposeUpD { docker-compose up -d}
Set-Alias dupd DockerComposeUpD

function DockerComposeDown { docker-compose down }
Set-Alias ddn DockerComposeDown

function DockerComposeLogs { docker-compose logs }
Set-Alias dlg DockerComposeLogs

function DockerComposeDjangoMakeMigrations {
    docker-compose exec backend python manage.py makemigrations
}
Set-Alias dmk DockerComposeDjangoMakeMigrations

function DockerComposeDjangoMigrate {
    docker-compose exec backend python manage.py migrate
}
Set-Alias dmg DockerComposeDjangoMigrate

function DockerComposeDjangoCreateSuperUser {
    docker-compose exec backend python manage.py createsuperuser
}
Set-Alias dsp DockerComposeDjangoCreateSuperUser