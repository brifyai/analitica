// Servicio de Inferencia Causal para Análisis de Impacto TV-Web
// Implementa Difference-in-Differences, Synthetic Control y métodos de robustez

export class CausalInferenceService {
  constructor() {
    this.confidenceLevel = 0.95;
    this.alpha = 1 - this.confidenceLevel;
  }

  /**
   * Método principal: Difference-in-Differences Analysis
   * @param {Object} spotData - Datos del spot
   * @param {Object} treatmentData - Datos durante el spot
   * @param {Object} controlData - Datos de control (día anterior, semana anterior)
   * @param {Object} preTreatmentData - Datos pre-tratamiento para validar parallel trends
   * @returns {Object} Resultado del análisis DiD
   */
  async performDifferenceInDifferences(spotData, treatmentData, controlData, preTreatmentData) {
    try {
      // 1. Validar supuestos del modelo DiD
      const assumptionsValidation = this.validateDiDAssumptions(preTreatmentData, controlData);
      
      // 2. Calcular efectos para cada métrica
      const metrics = ['activeUsers', 'sessions', 'pageviews'];
      const didResults = {};
      
      for (const metric of metrics) {
        const treatment = treatmentData[metric] || 0;
        const control = controlData[metric] || 0;
        const preTreatment = preTreatmentData[metric] || 0;
        
        // Calcular Difference-in-Differences
        const didEstimate = this.calculateDiDEstimate(treatment, control, preTreatment);
        
        // Calcular intervalo de confianza bootstrap
        const confidenceInterval = await this.calculateBootstrapCI(
          [treatment, control, preTreatment], 
          didEstimate, 
          10000
        );
        
        // Test de significancia
        const significance = this.calculateStatisticalSignificance(didEstimate, confidenceInterval);
        
        didResults[metric] = {
          estimate: didEstimate,
          confidenceInterval: confidenceInterval,
          significance: significance,
          effectSize: this.calculateEffectSize(didEstimate, control),
          practicalSignificance: this.assessPracticalSignificance(didEstimate, control)
        };
      }
      
      // 3. Validación de robustez
      const robustnessChecks = await this.performRobustnessChecks(spotData, didResults);
      
      // 4. Interpretación causal
      const causalInterpretation = this.interpretCausalEffect(didResults, assumptionsValidation);
      
      return {
        method: 'difference_in_differences',
        assumptions: assumptionsValidation,
        results: didResults,
        robustness: robustnessChecks,
        interpretation: causalInterpretation,
        generatesTraffic: causalInterpretation.causalEffect,
        confidence: causalInterpretation.confidenceLevel
      };
      
    } catch (error) {
      console.error('Error en análisis DiD:', error);
      return this.handleAnalysisError(error, 'difference_in_differences');
    }
  }

  /**
   * Synthetic Control Method
   * @param {Object} spotData - Datos del spot
   * @param {Array} donorPool - Pool de donantes (períodos sin spots)
   * @param {Object} treatmentData - Datos durante el tratamiento
   * @returns {Object} Resultado del Synthetic Control
   */
  async performSyntheticControl(spotData, donorPool, treatmentData) {
    try {
      // 1. Preparar datos del donor pool
      const preparedDonorPool = this.prepareDonorPool(donorPool, treatmentData);
      
      // 2. Optimizar pesos del control sintético
      const syntheticWeights = this.optimizeSyntheticWeights(preparedDonorPool, treatmentData);
      
      // 3. Crear control sintético
      const syntheticControl = this.createSyntheticControl(preparedDonorPool, syntheticWeights);
      
      // 4. Calcular efecto del tratamiento
      const treatmentEffect = this.calculateTreatmentEffect(treatmentData, syntheticControl);
      
      // 5. Validación con placebo tests
      const placeboResults = await this.performPlaceboTests(preparedDonorPool, syntheticWeights);
      
      // 6. Calcular intervalos de confianza
      const confidenceInterval = await this.calculateSyntheticControlCI(
        treatmentEffect, 
        placeboResults, 
        10000
      );
      
      return {
        method: 'synthetic_control',
        syntheticControl: syntheticControl,
        weights: syntheticWeights,
        treatmentEffect: treatmentEffect,
        confidenceInterval: confidenceInterval,
        placeboTests: placeboResults,
        generatesTraffic: treatmentEffect.estimate > 0 && confidenceInterval.lower > 0,
        confidence: this.calculateConfidenceLevel(confidenceInterval, treatmentEffect)
      };
      
    } catch (error) {
      console.error('Error en Synthetic Control:', error);
      return this.handleAnalysisError(error, 'synthetic_control');
    }
  }

  /**
   * Propensity Score Matching
   * @param {Array} treatmentGroup - Grupo de tratamiento (spots)
   * @param {Array} controlGroup - Grupo de control (períodos sin spots)
   * @returns {Object} Resultado del matching
   */
  async performPropensityScoreMatching(treatmentGroup, controlGroup) {
    try {
      // 1. Estimar propensity scores
      const propensityScores = this.estimatePropensityScores(treatmentGroup, controlGroup);
      
      // 2. Realizar matching
      const matchedPairs = this.performMatching(propensityScores, treatmentGroup, controlGroup);
      
      // 3. Calcular Average Treatment Effect
      const ate = this.calculateAverageTreatmentEffect(matchedPairs);
      
      // 4. Validar balance
      const balanceCheck = this.validateMatchingBalance(matchedPairs);
      
      // 5. Bootstrap para intervalos de confianza
      const confidenceInterval = await this.calculateMatchingCI(matchedPairs, 10000);
      
      return {
        method: 'propensity_score_matching',
        propensityScores: propensityScores,
        matchedPairs: matchedPairs,
        ate: ate,
        balance: balanceCheck,
        confidenceInterval: confidenceInterval,
        generatesTraffic: ate.estimate > 0 && confidenceInterval.lower > 0,
        confidence: this.calculateConfidenceLevel(confidenceInterval, ate)
      };
      
    } catch (error) {
      console.error('Error en Propensity Score Matching:', error);
      return this.handleAnalysisError(error, 'propensity_score_matching');
    }
  }

  /**
   * Análisis de Lag Temporal y Decay
   * @param {Object} spotData - Datos del spot
   * @param {Array} timeSeriesData - Serie temporal de tráfico
   * @returns {Object} Análisis temporal
   */
  async performTemporalAnalysis(spotData, timeSeriesData) {
    try {
      // 1. Análisis de cross-correlation
      const crossCorrelation = this.calculateCrossCorrelation(spotData, timeSeriesData);
      
      // 2. Identificar lag óptimo
      const optimalLag = this.identifyOptimalLag(crossCorrelation);
      
      // 3. Modelar decay temporal
      const decayModel = this.fitDecayModel(timeSeriesData, spotData);
      
      // 4. Ventanas temporales
      const temporalWindows = this.defineTemporalWindows(optimalLag, decayModel);
      
      // 5. Validar precedencia temporal
      const temporalPrecedence = this.validateTemporalPrecedence(spotData, timeSeriesData);
      
      return {
        method: 'temporal_analysis',
        crossCorrelation: crossCorrelation,
        optimalLag: optimalLag,
        decayModel: decayModel,
        temporalWindows: temporalWindows,
        temporalPrecedence: temporalPrecedence,
        generatesTraffic: temporalPrecedence.valid && decayModel.significant,
        confidence: temporalPrecedence.confidence
      };
      
    } catch (error) {
      console.error('Error en análisis temporal:', error);
      return this.handleAnalysisError(error, 'temporal_analysis');
    }
  }

  /**
   * Placebo Tests para validar robustez
   * @param {Array} data - Datos del análisis
   * @param {Object} method - Método utilizado
   * @returns {Object} Resultados de placebo tests
   */
  async performPlaceboTests(data, method) {
    try {
      const nPlacebos = 50;
      const placeboResults = [];
      
      // Generar placebos temporales
      for (let i = 0; i < nPlacebos; i++) {
        const placeboData = this.generateTemporalPlacebo(data);
        const placeboResult = await this.runAnalysisWithPlacebo(placeboData, method);
        placeboResults.push(placeboResult);
      }
      
      // Calcular tasa de falsos positivos
      const falsePositiveRate = this.calculateFalsePositiveRate(placeboResults);
      
      // Validar que la tasa sea baja
      const placeboValidation = {
        falsePositiveRate: falsePositiveRate,
        threshold: 0.05, // 5% máximo
        valid: falsePositiveRate <= 0.05,
        interpretation: this.interpretPlaceboResults(falsePositiveRate)
      };
      
      return placeboValidation;
      
    } catch (error) {
      console.error('Error en placebo tests:', error);
      return { error: error.message, valid: false };
    }
  }

  /**
   * Rosenbaum Bounds para sensibilidad a confusores no observados
   * @param {Object} treatmentEffect - Efecto del tratamiento
   * @param {Object} matchedData - Datos emparejados
   * @returns {Object} Análisis de sensibilidad
   */
  calculateRosenbaumBounds(treatmentEffect, matchedData) {
    try {
      const gammaValues = [1, 1.1, 1.2, 1.5, 2, 2.5, 3];
      const bounds = [];
      
      for (const gamma of gammaValues) {
        const bound = this.calculateRosenbaumBound(treatmentEffect, matchedData, gamma);
        bounds.push({ gamma, bound });
      }
      
      // Encontrar punto de quiebre
      const tippingPoint = bounds.find(b => b.bound > 0.05)?.gamma || Infinity;
      
      return {
        bounds: bounds,
        tippingPoint: tippingPoint,
        interpretation: this.interpretRosenbaumBounds(tippingPoint),
        robust: tippingPoint > 2.0
      };
      
    } catch (error) {
      console.error('Error en Rosenbaum bounds:', error);
      return { error: error.message, robust: false };
    }
  }

  // Métodos auxiliares privados

  /**
   * Validar supuestos del modelo DiD
   */
  validateDiDAssumptions(preTreatmentData, controlData) {
    const validations = {
      parallelTrends: this.testParallelTrends(preTreatmentData, controlData),
      commonShock: this.testCommonShock(preTreatmentData, controlData),
      sutva: this.testSUTVA(preTreatmentData, controlData)
    };
    
    const allValid = Object.values(validations).every(v => v.valid);
    
    return {
      valid: allValid,
      assumptions: validations,
      confidence: this.calculateAssumptionConfidence(validations)
    };
  }

  /**
   * Calcular estimador DiD
   */
  calculateDiDEstimate(treatment, control, preTreatment) {
    const treatmentEffect = treatment - preTreatment;
    const controlEffect = control - preTreatment;
    return treatmentEffect - controlEffect;
  }

  /**
   * Bootstrap para intervalos de confianza
   */
  async calculateBootstrapCI(data, estimate, nBootstrap) {
    const bootstrapEstimates = [];
    
    for (let i = 0; i < nBootstrap; i++) {
      const resampledData = this.resampleWithReplacement(data);
      const resampledEstimate = this.calculateDiDEstimate(
        resampledData[0], 
        resampledData[1], 
        resampledData[2]
      );
      bootstrapEstimates.push(resampledEstimate);
    }
    
    bootstrapEstimates.sort((a, b) => a - b);
    
    const lowerIndex = Math.floor((this.alpha / 2) * nBootstrap);
    const upperIndex = Math.floor((1 - this.alpha / 2) * nBootstrap);
    
    return {
      lower: bootstrapEstimates[lowerIndex],
      upper: bootstrapEstimates[upperIndex],
      estimate: estimate
    };
  }

  /**
   * Test de significancia estadística
   */
  calculateStatisticalSignificance(estimate, confidenceInterval) {
    const includesZero = confidenceInterval.lower <= 0 && confidenceInterval.upper >= 0;
    
    return {
      significant: !includesZero,
      pValue: this.estimatePValue(estimate, confidenceInterval),
      confidenceLevel: this.confidenceLevel,
      interpretation: this.interpretSignificance(!includesZero, confidenceInterval)
    };
  }

  /**
   * Evaluar significancia práctica
   */
  assessPracticalSignificance(estimate, referencia) {
    const percentageChange = referencia > 0 ? (estimate / referencia) * 100 : 0;
    const threshold = 10; // 10% mínimo para ser prácticamente significativo
    
    return {
      percentageChange: percentageChange,
      practicallySignificant: Math.abs(percentageChange) >= threshold,
      effectSize: this.calculateCohenD(estimate, referencia),
      interpretation: this.interpretPracticalSignificance(percentageChange, threshold)
    };
  }

  /**
   * Interpretar efecto causal
   */
  interpretCausalEffect(results, assumptions) {
    const metrics = Object.keys(results);
    const significantMetrics = metrics.filter(m => results[m].significance.significant);
    const practicallySignificantMetrics = metrics.filter(m => results[m].practicalSignificance.practicallySignificant);
    
    const causalEffect = significantMetrics.length > 0 && practicallySignificantMetrics.length > 0;
    const confidenceLevel = this.calculateOverallConfidence(results, assumptions);
    
    return {
      causalEffect: causalEffect,
      confidenceLevel: confidenceLevel,
      significantMetrics: significantMetrics.length,
      totalMetrics: metrics.length,
      interpretation: this.generateCausalInterpretation(causalEffect, significantMetrics, metrics.length)
    };
  }

  /**
   * Manejo de errores en análisis
   */
  handleAnalysisError(error, method) {
    return {
      method: method,
      error: error.message,
      generatesTraffic: false,
      confidence: 0,
      interpretation: `Error en análisis ${method}: ${error.message}`
    };
  }

  // Métodos adicionales de utilidad...

  /**
   * Preparar donor pool para synthetic control
   */
  prepareDonorPool(donorPool, treatmentData) {
    // Implementar preparación del donor pool
    return donorPool.filter(d => this.isValidDonor(d, treatmentData));
  }

  /**
   * Optimizar pesos del control sintético
   */
  optimizeSyntheticWeights(donorPool, treatmentData) {
    // Implementar optimización de pesos
    const weights = donorPool.map(() => 1 / donorPool.length);
    return weights;
  }

  /**
   * Crear control sintético
   */
  createSyntheticControl(donorPool, weights) {
    // Implementar creación del control sintético
    return donorPool.reduce((control, donor, i) => {
      Object.keys(donor).forEach(key => {
        control[key] = (control[key] || 0) + donor[key] * weights[i];
      });
      return control;
    }, {});
  }

  /**
   * Calcular efecto del tratamiento
   */
  calculateTreatmentEffect(treatmentData, syntheticControl) {
    const effect = {};
    Object.keys(treatmentData).forEach(metric => {
      effect[metric] = treatmentData[metric] - (syntheticControl[metric] || 0);
    });
    return effect;
  }

  /**
   * Calcular cross-correlation
   */
  calculateCrossCorrelation(spotData, timeSeriesData) {
    // Implementar análisis de cross-correlation
    return { correlations: [], optimalLag: 0 };
  }

  /**
   * Identificar lag óptimo
   */
  identifyOptimalLag(crossCorrelation) {
    // Implementar identificación de lag óptimo
    return { lag: 0, correlation: 0 };
  }

  /**
   * Modelar decay temporal
   */
  fitDecayModel(timeSeriesData, spotData) {
    // Implementar modelo de decay
    return { significant: false, halfLife: 0 };
  }

  /**
   * Validar precedencia temporal
   */
  validateTemporalPrecedence(spotData, timeSeriesData) {
    // Implementar validación de precedencia temporal
    return { valid: false, confidence: 0 };
  }
}

export default CausalInferenceService;