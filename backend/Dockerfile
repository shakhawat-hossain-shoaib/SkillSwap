# ==============================================================================
# SkillSwap Backend (.NET 10 Web API) Dockerfile
# ==============================================================================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy csproj and restore dependencies
COPY SkillSwap.Api/SkillSwap.Api.csproj ./SkillSwap.Api/
RUN dotnet restore ./SkillSwap.Api/SkillSwap.Api.csproj

# Copy the rest of the source code and build
COPY SkillSwap.Api/ ./SkillSwap.Api/
WORKDIR /app/SkillSwap.Api
RUN dotnet publish -c Release -o /app/out

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/out .

EXPOSE 5080
ENV ASPNETCORE_URLS=http://+:5080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "SkillSwap.Api.dll"]
