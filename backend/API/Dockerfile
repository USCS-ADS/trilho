# Imagem da API Trilho (.NET 8). Build multi-stage; executa como usuário sem privilégios.
#   docker build -t trilho-api backend/API
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Restaura primeiro (camada em cache enquanto os .csproj não mudam).
COPY src/Trilho.Domain/Trilho.Domain.csproj src/Trilho.Domain/
COPY src/Trilho.Communication/Trilho.Communication.csproj src/Trilho.Communication/
COPY src/Trilho.Exception/Trilho.Exception.csproj src/Trilho.Exception/
COPY src/Trilho.Application/Trilho.Application.csproj src/Trilho.Application/
COPY src/Trilho.Infrastructure/Trilho.Infrastructure.csproj src/Trilho.Infrastructure/
COPY src/Trilho.Api/Trilho.Api.csproj src/Trilho.Api/
RUN dotnet restore src/Trilho.Api/Trilho.Api.csproj

COPY src/ src/
RUN dotnet publish src/Trilho.Api/Trilho.Api.csproj -c Release -o /app/publish --no-restore /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

# Chaves de Data Protection (segredos de webhook) precisam sobreviver a reinícios: monte um volume em /keys.
RUN mkdir -p /keys && chown -R $APP_UID /keys
ENV ASPNETCORE_ENVIRONMENT=Production \
    ASPNETCORE_HTTP_PORTS=8080 \
    Settings__DataProtectionKeysPath=/keys \
    Settings__UseForwardedHeaders=true

USER $APP_UID
EXPOSE 8080

ENTRYPOINT ["dotnet", "Trilho.Api.dll"]
