# NOTE

This is a simple backend bit for a simple fabric factory that some random person asked to be done in some random Facebook group. If you want to use it now, take for grant everything is working as intended and requested by this random person. If you need to this to be completed you can get as it is and use it. It is not finished but it is already in the right direction.

Missing some parts like tests, front, validation everywhere using Yup (it is already installed, configured and being used in only one part. Just need to replicate everywhere) and some other stuff like reports, swagger (need to apply over all other functions) and so on. This is quite easy to complete, be my guest if you wish.

# Instructions to run

- Install [Node](https://nodejs.org/en/download/package-manager/current), accordingly your current operational system
- Install [Docker](https://www.docker.com/products/docker-desktop/), accordingly your current operational system
- Install [Yarn](https://yarnpkg.com/getting-started/install), accordingly your current operational system
- Install [Bruno](https://www.usebruno.com/downloads), accordingly your current operational system. Open it and import the folder `Bruno` in this repository to it.
- Clone the repo using its link

> Note: if you are using a Windows version prior 11, do this process in a folder as close as possible to the root folder due [Windows characters limit for folders](https://learn.microsoft.com/en-us/windows/win32/fileio/maximum-file-path-limitation?tabs=registry). The limit is 260 characters for a folder path, which can be easily reached with packages.

- In your terminal, change the directory to the one you just cloned the repo and run the command `yarn`. This way will download and install the necessary packages to run this project.
- Rename the file `.env.example` to `.env` and change the values of the variables to anything you want. They will be used by Docker to build the images and also to use Adminer.

- Still in the same terminal and folder, run the command `yarn docker:build`, to build and run the docker container with MySQL database and Adminer web dashboard.

- Once everything is installed and running, you can use Bruno to test all routes. And also you can use `Swagger` at `http://localhost:3000/docs/` address to test all routes and see examples for each, after running the command `yarn start:dev` to run the project.

- The database is being saved inside this project folder, in the `.docker` folder in the root of this project. So, after you using this project, you can simply delete this folder as well to not clutter your computer.

Down below you will see a quick dictionary for this project, nothing too fancy. It is just due translations (Brazilian portuguese <> English) issues it had to be done.

# confeccao-back

## Pequeno dicionario

- factory é confecção, apenas mudado para não ter problemas de acentuação
- segment é segmento, apenas para manter consistência em inglês
- order é pedido, quando uma confecção faz um pedido, vai o segmento e a confecção na ordem do pedido.

# Como criar migrations?

Veja que no arquivo `package.json` tem um script chamado `model:create`. Veja que ele tem uma variável (`nome`), que para o nome da model . Tendo a model criada, será criado também a migration ao mesmo tempo. E, para usar este script é bem simples. Basta adicionar esta variável antes do comando. Logo ficará algo como

```bash
nome=Users yarn migration:create
```

Sim, pode ficar despreocupado que é desse jeito mesmo.

Desta forma, serão criados os arquivos em suas respectivas pastas de acordo com o que está configurado no arquivo `src/database/config/index.js`.

Desta forma será criada a model com um único atributo (`user:string`). Assim, bastará adicionar os campos restantes para os outros campos necessários.

O mesmo acontece para o script `migration:create`. Como ele serve para criar uma nova migration e precisa dar um novo nome para a migration, então este script irá ajudar neste momento.

[Fluxograma](https://app.diagrams.net/#G1BWAZDdyIzVhf7kJnolYHy2COuRgGGnFM#%7B%22pageId%22%3A%22C5RBs43oDa-KdzZeNtuy%22%7D)
