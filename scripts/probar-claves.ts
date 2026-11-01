// Prueba las 3 claves y muestra los saldos, sin gastar créditos (solo consultas de lectura)
// Uso: node --env-file=.env scripts/probar-claves.ts

async function probar(
  nombre: string,
  url: string,
  headers: Record<string, string>,
  mostrar: (datos: any) => string,
): Promise<void> {
  try {
    const res = await fetch(url, { headers });
    const datos = await res.json().catch(() => ({}));
    if (res.ok) {
      console.log(`✅ ${nombre}: funciona`);
      console.log(`   ${mostrar(datos)}`);
    } else {
      console.log(`❌ ${nombre}: error ${res.status}`);
      console.log(`   ${JSON.stringify(datos).slice(0, 300)}`);
    }
  } catch (e) {
    console.log(`❌ ${nombre}: no se pudo conectar (${(e as Error).message})`);
  }
}

// En OpenRouter, la clave puede funcionar aunque la cuenta no tenga saldo: por eso se revisan los créditos
await probar(
  'OpenRouter',
  'https://openrouter.ai/api/v1/credits',
  { Authorization: `Bearer ${process.env.API_KEY_OPENROUTER}` },
  (d) => {
    const total = d.data?.total_credits ?? 0;
    const usado = d.data?.total_usage ?? 0;
    const aviso = total === 0 ? '  ⚠️ sin créditos: carga saldo en openrouter.ai/settings/credits' : '';
    return `Saldo: $${(total - usado).toFixed(2)}${aviso}`;
  },
);

await probar(
  'ElevenLabs',
  'https://api.elevenlabs.io/v1/voices',
  { 'xi-api-key': process.env.API_KEY_ELEVENLABS ?? '' },
  (d) => `Voces en la cuenta: ${d.voices?.length ?? 0}`,
);

await probar(
  'HeyGen',
  'https://api.heygen.com/v3/users/me',
  { 'x-api-key': process.env.API_KEY_HEYGEN ?? '' },
  (d) => `Saldo: $${d.data?.wallet?.remaining_balance ?? '? (no aparece en wallet)'}`,
);
