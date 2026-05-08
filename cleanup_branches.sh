#!/bin/bash

# Ramas a excluir
EXCLUDED=("main" "master" "develop" "lbulkload_functionality")

# Obtener ramas locales
BRANCHES=$(git branch --format="%(refname:short)")

for branch in $BRANCHES; do
  skip=false
  for excl in "${EXCLUDED[@]}"; do
    if [[ "$branch" == "$excl" ]]; then
      skip=true
      break
    fi
  done
  
  if [ "$skip" = true ]; then
    continue
  fi
  
  # Preguntar al usuario
  echo -n "¿Deseas eliminar la rama '$branch'? (y/n): "
  read choice
  if [[ "$choice" == "y" || "$choice" == "Y" ]]; then
    git branch -D "$branch"
  else
    echo "Saltando '$branch'."
  fi
done

echo ""
echo "Estado final del repositorio:"
git branch -vv
