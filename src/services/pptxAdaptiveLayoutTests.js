// Sistema de Pruebas para IA Adaptativa PPTX
// Verifica el comportamiento de la IA con diferentes escenarios de contenido

import PPTXAdaptiveLayoutService from './pptxAdaptiveLayoutService.js';

class PPTXAdaptiveLayoutTests {
  constructor() {
    this.adaptiveService = new PPTXAdaptiveLayoutService();
    this.testResults = [];
  }

  /**
   * Ejecuta todas las pruebas de la IA adaptativa
   */
  async runAllTests() {
    console.log('🧪 INICIANDO PRUEBAS DE IA ADAPTATIVA PPTX');
    console.log('=============================================');

    this.testResults = [];

    // Escenarios de prueba
    await this.testScenario1_SimpleContent();
    await this.testScenario2_ComplexContent();
    await this.testScenario3_ManyItems();
    await this.testScenario4_Tables();
    await this.testScenario5_MixedContent();
    await this.testScenario6_LongText();
    await this.testScenario7_GridLayout();
    await this.testScenario8_EdgeCases();

    this.printTestSummary();
    return this.testResults;
  }

  /**
   * Escenario 1: Contenido simple que debe caber en una lámina
   */
  async testScenario1_SimpleContent() {
    console.log('\n📋 Escenario 1: Contenido Simple');
    
    const contentItems = [
      {
        text: 'Título Principal del Análisis',
        importance: 'high',
        type: 'title'
      },
      {
        text: 'Este es un subtítulo que describe brevemente el contenido.',
        importance: 'medium',
        type: 'subtitle'
      },
      {
        text: 'Punto clave 1 del análisis',
        importance: 'low',
        type: 'bullet'
      },
      {
        text: 'Punto clave 2 del análisis',
        importance: 'low',
        type: 'bullet'
      }
    ];

    const decisions = this.adaptiveService.makeAdaptiveDecisions(contentItems, { slideType: 'simple' });
    
    const result = {
      scenario: 'Contenido Simple',
      expected: 'Debería usar layout single-column sin división',
      actual: decisions.optimalLayout,
      passed: decisions.optimalLayout === 'single-column' && !decisions.shouldSplit,
      decisions: decisions
    };

    this.testResults.push(result);
    console.log(`✅ Resultado: ${result.passed ? 'PASÓ' : 'FALLÓ'} - Layout: ${decisions.optimalLayout}`);
  }

  /**
   * Escenario 2: Contenido complejo que requiere división
   */
  async testScenario2_ComplexContent() {
    console.log('\n📊 Escenario 2: Contenido Complejo');
    
    const contentItems = [
      {
        text: 'Análisis Detallado de Múltiples Spots de TV con Métricas Completas y Análisis de IA',
        importance: 'high',
        type: 'title'
      },
      {
        text: 'Este es un análisis muy detallado que incluye múltiples métricas, insights de inteligencia artificial, recomendaciones estratégicas, análisis temporal, correlaciones, y muchas otras características que hacen que el contenido sea muy denso y complejo para una sola lámina.',
        importance: 'medium',
        type: 'description'
      },
      {
        text: 'Métrica 1: Usuarios Activos - Durante el spot: 1,234 | Referencia: 987 | Cambio: +25.0%',
        importance: 'medium',
        type: 'metric'
      },
      {
        text: 'Métrica 2: Sesiones - Durante el spot: 567 | Referencia: 432 | Cambio: +31.2%',
        importance: 'medium',
        type: 'metric'
      },
      {
        text: 'Métrica 3: Vistas de Página - Durante el spot: 2,345 | Referencia: 1,876 | Cambio: +25.0%',
        importance: 'medium',
        type: 'metric'
      },
      {
        text: 'Insight de IA 1: El spot generó un impacto significativo en la audiencia objetivo durante los primeros 5 minutos de transmisión.',
        importance: 'low',
        type: 'insight'
      },
      {
        text: 'Insight de IA 2: Se detectó una correlación positiva entre el mensaje del spot y el aumento en búsquedas web relacionadas.',
        importance: 'low',
        type: 'insight'
      },
      {
        text: 'Recomendación 1: Replicar este formato en futuros spots durante horarios similares.',
        importance: 'low',
        type: 'recommendation'
      },
      {
        text: 'Recomendación 2: Considerar aumentar la frecuencia de spots similares durante las franjas horarias de mayor impacto.',
        importance: 'low',
        type: 'recommendation'
      }
    ];

    const decisions = this.adaptiveService.makeAdaptiveDecisions(contentItems, { slideType: 'complex' });
    
    const result = {
      scenario: 'Contenido Complejo',
      expected: 'Debería dividir el contenido en múltiples láminas',
      actual: decisions.shouldSplit ? 'Dividido' : 'No dividido',
      passed: decisions.shouldSplit,
      decisions: decisions
    };

    this.testResults.push(result);
    console.log(`✅ Resultado: ${result.passed ? 'PASÓ' : 'FALLÓ'} - ${decisions.shouldSplit ? 'Dividido en ' + decisions.contentDistribution.length + ' láminas' : 'No dividido'}`);
  }

  /**
   * Escenario 3: Muchos elementos pequeños
   */
  async testScenario3_ManyItems() {
    console.log('\n📝 Escenario 3: Muchos Elementos Pequeños');
    
    const contentItems = [];
    
    // Generar 20 elementos pequeños
    for (let i = 1; i <= 20; i++) {
      contentItems.push({
        text: `Elemento ${i}: Información breve ${i}`,
        importance: 'low',
        type: 'bullet'
      });
    }

    const decisions = this.adaptiveService.makeAdaptiveDecisions(contentItems, { slideType: 'list' });
    
    const result = {
      scenario: 'Muchos Elementos',
      expected: 'Debería usar layout vertical-list y dividir si es necesario',
      actual: decisions.optimalLayout,
      passed: decisions.optimalLayout === 'vertical-list' || decisions.shouldSplit,
      decisions: decisions
    };

    this.testResults.push(result);
    console.log(`✅ Resultado: ${result.passed ? 'PASÓ' : 'FALLÓ'} - Layout: ${decisions.optimalLayout}`);
  }

  /**
   * Escenario 4: Contenido con tablas
   */
  async testScenario4_Tables() {
    console.log('\n📊 Escenario 4: Contenido con Tablas');
    
    const contentItems = [
      {
        text: 'Análisis Comparativo de Métricas',
        importance: 'high',
        type: 'title'
      },
      {
        type: 'table',
        data: [
          ['Métrica', 'Spot 1', 'Spot 2', 'Spot 3', 'Promedio'],
          ['Usuarios Activos', '1,234', '987', '1,456', '1,226'],
          ['Sesiones', '567', '432', '623', '541'],
          ['Vistas de Página', '2,345', '1,876', '2,567', '2,263'],
          ['Duración Promedio', '2:34', '3:12', '2:45', '2:50'],
          ['Tasa de Conversión', '12.5%', '8.7%', '15.2%', '12.1%']
        ],
        importance: 'high'
      },
      {
        text: 'Las tablas requieren espacio adicional y deben ser consideradas como elementos complejos.',
        importance: 'medium',
        type: 'description'
      }
    ];

    const decisions = this.adaptiveService.makeAdaptiveDecisions(contentItems, { slideType: 'table' });
    
    const result = {
      scenario: 'Contenido con Tablas',
      expected: 'Debería reconocer la complejidad de las tablas',
      actual: decisions.optimalLayout,
      passed: decisions.optimalLayout === 'single-column' || decisions.optimalLayout === 'card-layout',
      decisions: decisions
    };

    this.testResults.push(result);
    console.log(`✅ Resultado: ${result.passed ? 'PASÓ' : 'FALLÓ'} - Layout: ${decisions.optimalLayout}`);
  }

  /**
   * Escenario 5: Contenido mixto
   */
  async testScenario5_MixedContent() {
    console.log('\n🎯 Escenario 5: Contenido Mixto');
    
    const contentItems = [
      {
        text: 'Dashboard de Análisis Integral',
        importance: 'high',
        type: 'title'
      },
      {
        text: 'Métrica Principal: Impacto promedio del 25%',
        importance: 'medium',
        type: 'metric'
      },
      {
        text: 'Insight clave generado por IA sobre patrones de audiencia',
        importance: 'medium',
        type: 'insight'
      },
      {
        text: 'Recomendación estratégica para optimización futura',
        importance: 'medium',
        type: 'recommendation'
      },
      {
        text: 'Análisis temporal detallado con múltiples variables',
        importance: 'low',
        type: 'analysis'
      }
    ];

    const decisions = this.adaptiveService.makeAdaptiveDecisions(contentItems, { slideType: 'mixed' });
    
    const result = {
      scenario: 'Contenido Mixto',
      expected: 'Debería usar layout apropiado para contenido variado',
      actual: decisions.optimalLayout,
      passed: ['grid-2x2', 'two-column', 'vertical-list'].includes(decisions.optimalLayout),
      decisions: decisions
    };

    this.testResults.push(result);
    console.log(`✅ Resultado: ${result.passed ? 'PASÓ' : 'FALLÓ'} - Layout: ${decisions.optimalLayout}`);
  }

  /**
   * Escenario 6: Texto muy largo
   */
  async testScenario6_LongText() {
    console.log('\n📖 Escenario 6: Texto Muy Largo');
    
    const longText = 'Este es un texto extremadamente largo que describe en detalle todos los aspectos del análisis de spots de TV. Incluye información sobre metodología, resultados, conclusiones, recomendaciones, insights de inteligencia artificial, análisis temporal, correlaciones estadísticas, y muchos otros elementos que hacen que el contenido sea muy extenso y denso. El texto continúa con más detalles sobre la interpretación de los datos, las implicaciones estratégicas, y las sugerencias para futuros análisis. También incluye referencias a estudios relacionados, metodologías aplicadas, y consideraciones técnicas importantes para la comprensión completa del análisis.';
    
    const contentItems = [
      {
        text: 'Análisis Exhaustivo con Texto Extenso',
        importance: 'high',
        type: 'title'
      },
      {
        text: longText,
        importance: 'medium',
        type: 'description'
      }
    ];

    const decisions = this.adaptiveService.makeAdaptiveDecisions(contentItems, { slideType: 'long-text' });
    
    const result = {
      scenario: 'Texto Muy Largo',
      expected: 'Debería aplicar escalado de fuente o división',
      actual: decisions.fontScale < 1.0 ? `Escalado: ${(decisions.fontScale * 100).toFixed(1)}%` : 'Sin escalado',
      passed: decisions.fontScale < 1.0 || decisions.shouldSplit,
      decisions: decisions
    };

    this.testResults.push(result);
    console.log(`✅ Resultado: ${result.passed ? 'PASÓ' : 'FALLÓ'} - ${result.actual}`);
  }

  /**
   * Escenario 7: Layout de grid
   */
  async testScenario7_GridLayout() {
    console.log('\n🔲 Escenario 7: Layout de Grid');
    
    const contentItems = [
      {
        text: 'Componentes del Dashboard',
        importance: 'high',
        type: 'title'
      },
      {
        text: 'Componente 1: Métricas en tiempo real',
        importance: 'medium',
        type: 'component'
      },
      {
        text: 'Componente 2: Gráficos de tendencias',
        importance: 'medium',
        type: 'component'
      },
      {
        text: 'Componente 3: Análisis predictivo',
        importance: 'medium',
        type: 'component'
      },
      {
        text: 'Componente 4: Insights de IA',
        importance: 'medium',
        type: 'component'
      }
    ];

    const decisions = this.adaptiveService.makeAdaptiveDecisions(contentItems, { slideType: 'grid' });
    
    const result = {
      scenario: 'Layout de Grid',
      expected: 'Debería usar grid-2x2 para 4 componentes',
      actual: decisions.optimalLayout,
      passed: decisions.optimalLayout === 'grid-2x2',
      decisions: decisions
    };

    this.testResults.push(result);
    console.log(`✅ Resultado: ${result.passed ? 'PASÓ' : 'FALLÓ'} - Layout: ${decisions.optimalLayout}`);
  }

  /**
   * Escenario 8: Casos extremos
   */
  async testScenario8_EdgeCases() {
    console.log('\n⚠️ Escenario 8: Casos Extremos');
    
    // Caso extremo 1: Contenido vacío
    const emptyContent = [];
    const emptyDecisions = this.adaptiveService.makeAdaptiveDecisions(emptyContent, { slideType: 'empty' });
    
    // Caso extremo 2: Un solo elemento muy grande
    const hugeContent = [
      {
        text: 'A'.repeat(2000), // 2000 caracteres
        importance: 'high',
        type: 'title'
      }
    ];
    const hugeDecisions = this.adaptiveService.makeAdaptiveDecisions(hugeContent, { slideType: 'huge' });

    const result1 = {
      scenario: 'Contenido Vacío',
      expected: 'Debería manejar contenido vacío gracefully',
      actual: emptyDecisions.optimalLayout,
      passed: emptyDecisions.optimalLayout === 'single-column',
      decisions: emptyDecisions
    };

    const result2 = {
      scenario: 'Contenido Enorme',
      expected: 'Debería manejar contenido muy grande',
      actual: hugeDecisions.fontScale < 1.0 ? 'Escalado aplicado' : 'Sin escalado',
      passed: hugeDecisions.fontScale < 1.0 || hugeDecisions.shouldSplit,
      decisions: hugeDecisions
    };

    this.testResults.push(result1, result2);
    console.log(`✅ Resultado 1: ${result1.passed ? 'PASÓ' : 'FALLÓ'} - ${result1.actual}`);
    console.log(`✅ Resultado 2: ${result2.passed ? 'PASÓ' : 'FALLÓ'} - ${result2.actual}`);
  }

  /**
   * Imprime resumen de todas las pruebas
   */
  printTestSummary() {
    console.log('\n📊 RESUMEN DE PRUEBAS');
    console.log('=====================');
    
    const passedTests = this.testResults.filter(test => test.passed).length;
    const totalTests = this.testResults.length;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    console.log(`Total de pruebas: ${totalTests}`);
    console.log(`Pruebas exitosas: ${passedTests}`);
    console.log(`Tasa de éxito: ${successRate}%`);
    
    console.log('\nDetalles por prueba:');
    this.testResults.forEach((test, index) => {
      const status = test.passed ? '✅' : '❌';
      console.log(`${status} ${test.scenario}: ${test.actual}`);
    });

    if (passedTests === totalTests) {
      console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON! La IA adaptativa está funcionando correctamente.');
    } else {
      console.log('\n⚠️ Algunas pruebas fallaron. Revisar la implementación de la IA adaptativa.');
    }
  }

  /**
   * Prueba específica de validación de contenido
   */
  testContentValidation() {
    console.log('\n🔍 PRUEBA DE VALIDACIÓN DE CONTENIDO');
    console.log('=====================================');

    // Contenido que debería caber
    const fittingContent = [
      { text: 'Título', importance: 'high' },
      { text: 'Subtítulo', importance: 'medium' },
      { text: 'Punto 1', importance: 'low' },
      { text: 'Punto 2', importance: 'low' }
    ];

    // Contenido que no debería caber
    const overflowingContent = [];
    for (let i = 0; i < 50; i++) {
      overflowingContent.push({
        text: `Línea muy larga de contenido número ${i} que describe detalles específicos del análisis`,
        importance: 'low'
      });
    }

    const fittingValidation = this.adaptiveLayoutService.validateContentFits(fittingContent);
    const overflowingValidation = this.adaptiveLayoutService.validateContentFits(overflowingContent);

    console.log('Contenido que debería caber:');
    console.log(`- Cabe en lámina: ${fittingValidation.fits}`);
    console.log(`- Utilización: ${fittingValidation.utilization.toFixed(1)}%`);
    console.log(`- Recomendaciones: ${fittingValidation.recommendations.length}`);

    console.log('\nContenido que no debería caber:');
    console.log(`- Cabe en lámina: ${overflowingValidation.fits}`);
    console.log(`- Utilización: ${overflowingValidation.utilization.toFixed(1)}%`);
    console.log(`- Recomendaciones: ${overflowingValidation.recommendations.length}`);

    return {
      fitting: fittingValidation,
      overflowing: overflowingValidation
    };
  }
}

export default PPTXAdaptiveLayoutTests;