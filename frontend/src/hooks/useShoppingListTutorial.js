import { useEffect, useState } from "react";

const STORAGE_KEY = "shopping-list-tutorial-seen";

const buildTutorialSteps = () => ([
  {
    intro: "Este tutorial es corto: crea o elige una lista, anade productos, compra siguiendo la lista y termina subiendo los precios reales.",
    title: "Guia rapida",
  },
  {
    element: "[data-tutorial='new-list-btn']",
    title: "Crear la lista",
    intro: "Crea una lista nueva si vas a comprar en otro supermercado o quieres separar una compra distinta.",
    position: "bottom",
  },
  {
    element: "[data-tutorial='lists-sidebar']",
    title: "Varias listas",
    intro: "Desde aqui cambias de lista rapido y puedes duplicarla si haces compras parecidas cada semana.",
    position: "right",
  },
  {
    element: "[data-tutorial='prepare-tab']",
    title: "Preparar",
    intro: "Esta es la primera seccion del flujo. Aqui preparas la lista y dejas cerrados productos, marcas y cantidades.",
    position: "bottom",
  },
  {
    element: "[data-tutorial='shop-tab']",
    title: "Comprar",
    intro: "Esta seccion es para usarla en directo en el super: marcas lo comprado, ajustas cambios y registras el precio real.",
    position: "bottom",
  },
  {
    element: "[data-tutorial='finish-tab']",
    title: "Finalizar",
    intro: "En la ultima seccion revisas la compra terminada y subes los precios reales a la base de datos.",
    position: "bottom",
  },
  {
    element: "[data-tutorial='submit-prices-btn']",
    title: "Subir precios",
    intro: "Al subir, la lista no se borra: se limpia la compra actual y se mantiene como plantilla para reutilizarla.",
    position: "top",
  },
  {
    title: "Flujo listo",
    intro: "Ese es el flujo completo: preparar, comprar y cerrar compra sin perder la lista para la siguiente vez.",
  },
]);

const isVisibleElement = (element) => {
  if (!element) {
    return false;
  }

  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
};

export const useShoppingListTutorial = (shouldStart = false) => {
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState(null);

  const activeStep = isOpen ? steps[currentStep] || null : null;

  const closeTutorial = (markSeen = true) => {
    setIsOpen(false);
    setHighlightRect(null);

    if (markSeen) {
      localStorage.setItem(STORAGE_KEY, "true");
      setHasSeenTutorial(true);
    }
  };

  const startTutorial = () => {
    if (typeof window === "undefined") {
      return;
    }

    const resolvedSteps = buildTutorialSteps().filter((step) => {
      if (!step.element) {
        return true;
      }

      const element = document.querySelector(step.element);
      return isVisibleElement(element);
    });

    if (!resolvedSteps.length) {
      return;
    }

    setSteps(resolvedSteps);
    setCurrentStep(0);
    setIsOpen(true);
  };

  const nextStep = () => {
    if (currentStep >= steps.length - 1) {
      closeTutorial(true);
      return;
    }

    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    if (!isOpen || !activeStep) {
      return undefined;
    }

    const updateRect = () => {
      if (!activeStep.element) {
        setHighlightRect(null);
        return;
      }

      const element = document.querySelector(activeStep.element);
      if (!isVisibleElement(element)) {
        setHighlightRect(null);
        return;
      }

      element.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      const rect = element.getBoundingClientRect();
      setHighlightRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [isOpen, activeStep]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const tutorialSeen = localStorage.getItem(STORAGE_KEY);
    if (!tutorialSeen && shouldStart) {
      setHasSeenTutorial(false);
      const timer = setTimeout(() => startTutorial(), 700);
      return () => clearTimeout(timer);
    }

    setHasSeenTutorial(Boolean(tutorialSeen));
    return undefined;
  }, [shouldStart]);

  const resetTutorial = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHasSeenTutorial(false);
  };

  return {
    startTutorial,
    resetTutorial,
    hasSeenTutorial,
    tutorial: {
      isOpen,
      steps,
      currentStep,
      activeStep,
      highlightRect,
    },
    nextStep,
    prevStep,
    closeTutorial,
  };
};
