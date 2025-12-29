/**
 * Script de prueba para verificar la conectividad con chutes.ai
 */

const CHUTES_API_KEY = process.env.REACT_APP_CHUTES_API_KEY || 'cpk_f07741417dab421f995b63e2b9869206.272f8a269e1b5ec092ba273b83403b1d.u5no8AouQcBglfhegVrjdcU98kPSCkYt';
const CHUTES_API_URL = 'https://llm.chutes.ai/v1';

async function testChutesConnectivity() {
  console.log('🔍 Probando conectividad con Chutes AI...');
  console.log('📡 URL:', CHUTES_API_URL);
  console.log('🔑 API Key:', CHUTES_API_KEY.substring(0, 20) + '...');
  
  try {
    // Test 1: Verificar modelos disponibles
    console.log('\n📋 Test 1: Verificando modelos disponibles...');
    const modelsResponse = await fetch(`${CHUTES_API_URL}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CHUTES_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Respuesta modelos:', modelsResponse.status, modelsResponse.statusText);
    
    if (modelsResponse.ok) {
      const modelsData = await modelsResponse.json();
      console.log('✅ Modelos disponibles:', modelsData.data?.length || 0);
      
      // Buscar modelos VL
      const vlModels = modelsData.data?.filter(model => 
        model.id.includes('VL') || model.id.includes('vision')
      ) || [];
      console.log('🎬 Modelos VL encontrados:', vlModels.length);
      vlModels.forEach(model => {
        console.log('  -', model.id);
      });
    } else {
      const errorText = await modelsResponse.text();
      console.log('❌ Error en modelos:', errorText);
    }
    
    // Test 2: Test de chat simple
    console.log('\n💬 Test 2: Test de chat simple...');
    const chatResponse = await fetch(`${CHUTES_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CHUTES_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen2.5-VL-72B-Instruct',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Responde solo "OK" si recibes este mensaje.'
              }
            ]
          }
        ],
        max_tokens: 10,
        temperature: 0.1
      })
    });
    
    console.log('📡 Respuesta chat:', chatResponse.status, chatResponse.statusText);
    
    if (chatResponse.ok) {
      const chatData = await chatResponse.json();
      console.log('✅ Chat exitoso:', chatData.choices?.[0]?.message?.content || 'Sin respuesta');
      console.log('📊 Tokens usados:', chatData.usage?.total_tokens || 0);
    } else {
      const errorText = await chatResponse.text();
      console.log('❌ Error en chat:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
    console.error('📋 Stack:', error.stack);
  }
}

// Ejecutar test
testChutesConnectivity();