import { useState, useEffect } from 'react';

export const useCatalogos = () => {
    const [catalogos, setCatalogos] = useState({
        generos: [],
        tiposDocumento: [],
        tiposSangre: [],
        estadosCiviles: [],
        especialidades: [],
        categoriasTerapias: [],
        estadosCitas: []
    });

    useEffect(() => {
        const cargarDatos = async () => {
            // Lee la URL base desde .env (VITE_API_URL) o usa el puerto 5298 por defecto
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5298/api';
            const baseUrl = `${API_URL}/Catalogos`;
            
            try {
                // Peticiones en paralelo a los endpoints dinámicos
                const [gen, doc, san, civ, esp, cat, est] = await Promise.all([
                    fetch(`${baseUrl}/Generos`).then(r => r.json()),
                    fetch(`${baseUrl}/TiposDocumento`).then(r => r.json()),
                    fetch(`${baseUrl}/TiposSangre`).then(r => r.json()),
                    fetch(`${baseUrl}/EstadosCiviles`).then(r => r.json()),
                    fetch(`${baseUrl}/Especialidades`).then(r => r.json()),
                    fetch(`${baseUrl}/CategoriasTerapias`).then(r => r.json()),
                    fetch(`${baseUrl}/EstadosCitas`).then(r => r.json()),
                ]);

                setCatalogos({
                    generos: gen,
                    tiposDocumento: doc,
                    tiposSangre: san,
                    estadosCiviles: civ,
                    especialidades: esp,
                    categoriasTerapias: cat,
                    estadosCitas: est
                });
            } catch (error) {
                console.error("Error cargando catálogos:", error);
            }
        };

        cargarDatos();
    }, []);

    return catalogos;
};