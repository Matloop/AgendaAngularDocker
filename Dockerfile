# Estágio 1: Build da aplicação Angular
FROM node:20-alpine AS build # Usa imagem Node.js como estágio de build nomeado 'build'
WORKDIR /app # Define diretório de trabalho
COPY package*.json ./ # Copia arquivos de dependência
RUN npm ci # Instala dependências de forma otimizada para CI/CD
COPY . . # Copia o restante do código-fonte do Angular
# Executa o build de produção do Angular
# --output-path especifica o diretório de saída (pode ser redundante se já estiver no angular.json)
RUN npm run build -- --configuration production --output-path=./dist/agenda

# Estágio 2: Servir a aplicação com Nginx
FROM nginx:1.25-alpine # Usa imagem base leve do Nginx
# Copia a configuração customizada do Nginx para o local correto no container
COPY nginx.conf /etc/nginx/nginx.conf
# Copia os arquivos buildados do Angular (do estágio 'build') para o diretório web do Nginx
COPY --from=build /app/dist/agenda /usr/share/nginx/html
# NOTA: Certifique-se que '/app/dist/agenda' no COPY corresponde EXATAMENTE ao 'output-path' do RUN npm run build

# Expõe a porta 80 (porta padrão HTTP que o Nginx escuta)
EXPOSE 80
# Comando para iniciar o Nginx em modo foreground (necessário para Docker)
CMD ["nginx", "-g", "daemon off;"]
