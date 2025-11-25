from typing import AsyncIterator
from groq import AsyncGroq
from .base import BaseLLMProvider, LLMModel
from config import get_settings


class GroqProvider(BaseLLMProvider):
    """Groq API를 통한 LLM 제공자"""

    def __init__(self):
        settings = get_settings()
        self.client = AsyncGroq(api_key=settings.groq_api_key)

    @property
    def provider_name(self) -> str:
        return "groq"

    @property
    def available_models(self) -> list[LLMModel]:
        # Groq Production 모델 (2025년 최신)
        # 참고: https://console.groq.com/docs/models
        return [
            LLMModel(
                id="llama-3.1-8b-instant",
                name="Llama 3.1 8B",
                provider=self.provider_name,
                description="빠르고 효율적 (560 tok/s)",
                context_length=131072,
                korean_support=True,
            ),
            LLMModel(
                id="llama-3.3-70b-versatile",
                name="Llama 3.3 70B",
                provider=self.provider_name,
                description="Meta 최신 고성능 (280 tok/s)",
                context_length=131072,
                korean_support=True,
            ),
            LLMModel(
                id="openai/gpt-oss-20b",
                name="GPT OSS 20B",
                provider=self.provider_name,
                description="OpenAI 경량 모델 (1000 tok/s)",
                context_length=131072,
                korean_support=True,
            ),
            LLMModel(
                id="openai/gpt-oss-120b",
                name="GPT OSS 120B",
                provider=self.provider_name,
                description="OpenAI 대형 모델 (500 tok/s)",
                context_length=131072,
                korean_support=True,
            ),
        ]

    async def generate(
        self,
        prompt: str,
        model_id: str,
        system_prompt: str = "",
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> str:
        """텍스트 생성"""
        messages = []

        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})

        messages.append({"role": "user", "content": prompt})

        response = await self.client.chat.completions.create(
            model=model_id,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )

        return response.choices[0].message.content

    async def generate_stream(
        self,
        prompt: str,
        model_id: str,
        system_prompt: str = "",
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> AsyncIterator[str]:
        """스트리밍 텍스트 생성"""
        messages = []

        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})

        messages.append({"role": "user", "content": prompt})

        stream = await self.client.chat.completions.create(
            model=model_id,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            stream=True,
        )

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
