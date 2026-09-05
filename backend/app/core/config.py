from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    database_url: str

    nvidia_api_key: str
    nvidia_base_url: str = "https://integrate.api.nvidia.com/v1"
    nvidia_llm_model: str

    class Config:
        env_file = ".env"


settings = Settings()