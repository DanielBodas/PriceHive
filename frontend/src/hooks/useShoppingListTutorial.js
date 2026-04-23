import { useEffect, useState } from "react";

const STORAGE_KEY = "shopping-list-tutorial-seen";

const buildTutorialSteps = () => ([
  {
    intro: "Te ensenamos lo basico: crea una lista, anade productos, y durante la compra marca lo comprado anotando el precio real. Al final, un boton sube todo a la base de datos.",
    title: "Asi funciona tu lista",
  },
  {
    element: "[data-tutorial='new-list-btn']",
    title: "Crear lista",
    intro: "Crea una lista por supermercado. Asi separas las compras y podemos comparar precios entre tiendas.",
    position: "bottom",
  },
  {
    element: "[data-tutorial='lists-grid']",
    title: "Tus listas",
    intro: "Desde aqui eliges con cual compras hoy. Puedes duplicar una lista para repetirla cada semana.",
    position: "top",
  },
  {
    element: "[data-tutorial='price-input-example']",
    title: "El precio es lo importante",
    intro: "Cuando encuentres un producto, toca aqui y escribe el precio que veas en la etiqueta. Se marcara como comprado automaticamente.",
    position: "top",
  },
  {
    element: "[data-tutorial='brand-switcher']",
    title: "Cambiar marca en tienda",
    intro: "Si tu marca no esta, toca el nombre de la marca para ver otras disponibles y cambiar al instante.",
    position: "bottom",
  },
  {
    element: "[data-tutorial='submit-prices-btn']",
    title: "Subir a la base de datos",
    intro: "Cuando termines, este boton sube todos los precios. Se guardan producto, marca, cantidad y precio unitario. La lista queda limpia para la proxima.",
    position: "top",
  },
  {
    title: "Listo para empezar",
    intro: "Crea tu primera lista o abre una existente. Lo demas lo iras descubriendo mientras compras.",
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
