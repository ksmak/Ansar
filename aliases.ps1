function DockerComposeBuild { docker-compose build }
Set-Alias dbd DockerComposeBuild

function DockerComposeUp { docker-compose up }
Set-Alias dup DockerComposeUp

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