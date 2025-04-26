FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src
COPY ["src/EduPlatform.API/EduPlatform.API.csproj", "EduPlatform.API/"]
RUN dotnet restore "EduPlatform.API/EduPlatform.API.csproj"
COPY . .
WORKDIR "/src/EduPlatform.API"
RUN dotnet build "EduPlatform.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "EduPlatform.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "EduPlatform.API.dll"] 