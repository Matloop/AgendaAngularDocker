# Dockerfile (Frontend)

# --- Estágio 1: Build da aplicação Angular ---
# Usa uma imagem Node.js como base temporária para o build e nomeia este estágio como 'build'
FROM node:20-alpine AS build
# Define o diretório de trabalho dentro deste estágio
WORKDIR /app
# Copia os arquivos de definição de dependências
COPY package*.json ./
# Instala as dependências de forma otimizada e determinística (usa package-lock.json)
RUN npm ci
# Copia todo o código-fonte da aplicação Angular para o diretório de trabalho
COPY . .
# Executa o comando de build do Angular para produção
# '--output-path' define explicitamente o diretório de saída. Verifique se
# corresponde ao configurado em seu 'angular.json' se omitido.
RUN npm run build -- --configuration production --output-path=./dist/agenda

# --- Estágio 2: Servir a aplicação com Nginx ---
# Inicia um novo estágio a partir de uma imagem leve do Nginx
FROM nginx:1.25-alpine
# Copia o arquivo de configuração customizado do Nginx para o local padrão dentro da imagem
COPY nginx.conf /etc/nginx/nginx.conf
# Copia APENAS os arquivos resultantes do build (artefatos) do estágio 'build'
# para o diretório padrão de serviço web do Nginx.
# '/app/dist/agenda' deve corresponder ao 'output-path' do estágio anterior.
COPY --from=build /app/dist/agenda /usr/share/nginx/html

# Expõe a porta 80 (INFORMATIVO), onde o Nginx escutará dentro do container
EXPOSE 80
# Comando padrão para iniciar o Nginx em modo foreground, mantendo o container ativo
CMD ["nginx", "-g", "daemon off;"]
