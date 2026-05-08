def analyze_price_anomaly(new_price: float, historical_prices: list[float], user_points: int) -> dict:
    """
    Analiza si un nuevo precio es anómalo comparado con su histórico y la reputación del usuario.
    Devuelve un diccionario con el resultado:
    {
        "is_suspicious": bool,
        "reason": str | None,
        "confidence_score": float # 0.0 a 1.0 (1.0 = muy confiable)
    }
    """
    if not historical_prices:
        # Si no hay histórico, confiamos dependiendo del usuario.
        if user_points < 10:
            return {"is_suspicious": True, "reason": "Primer precio para este producto y usuario con baja reputación.", "confidence_score": 0.5}
        return {"is_suspicious": False, "reason": None, "confidence_score": 0.8}

    # Calcular media y desviación estándar de los últimos 5 precios
    recent_prices = historical_prices[-5:]
    avg_price = sum(recent_prices) / len(recent_prices)
    
    # Calcular el cambio porcentual
    percentage_diff = abs(new_price - avg_price) / avg_price

    # La tolerancia depende de la reputación del usuario
    # Usuarios nuevos (<50 pts) tienen menos margen (20%)
    # Usuarios intermedios (50-200 pts) tienen margen moderado (35%)
    # Usuarios confiables (>200 pts) tienen mayor margen (50%)
    
    if user_points < 50:
        tolerance = 0.20
        base_confidence = 0.4
    elif user_points < 200:
        tolerance = 0.35
        base_confidence = 0.7
    else:
        tolerance = 0.50
        base_confidence = 0.9

    if percentage_diff > tolerance:
        return {
            "is_suspicious": True, 
            "reason": f"Desviación del {percentage_diff*100:.1f}% respecto a la media ({avg_price:.2f}€). Tol: {tolerance*100:.0f}%.", 
            "confidence_score": base_confidence - 0.3
        }

    return {"is_suspicious": False, "reason": None, "confidence_score": base_confidence}
