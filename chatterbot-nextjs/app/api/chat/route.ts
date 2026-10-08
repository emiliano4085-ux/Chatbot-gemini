// app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { ChatRequestBody } from '@/types/chat';

export async function POST(req: Request) {
  try {
    const body: ChatRequestBody = await req.json();
    const { messages, config, apiKey: clientApiKey } = body;

    // Obtener la clave del servidor (.env.local) o del cliente si aún no se ha guardado en el servidor
    const envApiKey = process.env.GEMINI_API_KEY;
    const effectiveApiKey =
      envApiKey && envApiKey !== 'tu_clave_secreta_aqui' && envApiKey.trim().length > 0
        ? envApiKey.trim()
        : clientApiKey?.trim();

    if (!effectiveApiKey || effectiveApiKey === 'tu_clave_secreta_aqui') {
      return NextResponse.json(
        {
          error:
            'La API Key de Gemini no está configurada. Por favor define GEMINI_API_KEY en .env.local o ingrésala en el panel de configuración.',
        },
        { status: 401 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: effectiveApiKey });

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'El historial de mensajes no puede estar vacío.' },
        { status: 400 }
      );
    }

    // Formatear el historial para el SDK de Gemini
    const contents = messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    }));

    // Configuración de los hiperparámetros del modelo
    const requestConfig = {
      systemInstruction: config.systemInstruction
        ? config.systemInstruction
        : undefined,
      temperature: typeof config.temperature === 'number' ? config.temperature : 0.7,
      maxOutputTokens: typeof config.maxOutputTokens === 'number' ? config.maxOutputTokens : 1024,
      topP: typeof config.topP === 'number' ? config.topP : 0.95,
      topK: typeof config.topK === 'number' ? config.topK : 40,
    };

    let targetModel = config.modelName || 'gemini-3.8-flash';

    // Generar contenido con reintento automático si el modelo seleccionado no está disponible
    let response;
    try {
      response = await ai.models.generateContent({
        model: targetModel,
        contents: contents,
        config: requestConfig,
      });
    } catch (modelError: unknown) {
      const errStr = modelError instanceof Error ? modelError.message : String(modelError);
      // Si el modelo retorna 404 (ej. gemini-2.5-flash obsoleto para cuentas nuevas) o 503, intentar con modelos alternativos
      if (errStr.includes('404') || errStr.includes('no longer available') || errStr.includes('503')) {
        const fallbackModel = targetModel === 'gemini-3.8-flash' ? 'gemini-3.5-flash' : 'gemini-3.8-flash';
        console.warn(`Modelo ${targetModel} no disponible (${errStr}), reintentando con ${fallbackModel}...`);
        targetModel = fallbackModel;
        response = await ai.models.generateContent({
          model: targetModel,
          contents: contents,
          config: requestConfig,
        });
      } else {
        throw modelError;
      }
    }

    const replyText = response.text || 'Sin respuesta generada por el modelo.';

    return NextResponse.json({
      text: replyText,
      usageMetadata: response.usageMetadata,
      modelUsed: targetModel,
    });
  } catch (error: unknown) {
    console.error('Error en /api/chat:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Ocurrió un error al procesar la solicitud con Gemini.';
    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
