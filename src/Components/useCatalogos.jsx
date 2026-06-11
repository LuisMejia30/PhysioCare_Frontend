import { useState, useEffect } from 'react';

export const useCatalogos = () => {
    const [catalogos, setCatalogos] = useState({
        generos: [],
        tiposDocumento: [],
        tiposSangre: [],
        estadosCiviles: [],
        especialidades: [],
        categoriasTerapias: [],
        estadosCitas: [] // Nuevo catálogo añadido
    });

    useEffect(() => {
        const cargarDatos = async () => {
            const baseUrl = 'https://localhost:7205/api/Catalogos';
            
            try {
                // Hacemos todas las peticiones en paralelo
                const [gen, doc, san, civ, esp, cat, est] = await Promise.all([
                    fetch(`${baseUrl}/Generos`).then(r => r.json()),
                    fetch(`${baseUrl}/TiposDocumento`).then(r => r.json()),
                    fetch(`${baseUrl}/TiposSangre`).then(r => r.json()),
                    fetch(`${baseUrl}/EstadosCiviles`).then(r => r.json()),
                    fetch(`${baseUrl}/Especialidades`).then(r => r.json()),
                    fetch(`${baseUrl}/CategoriasTerapias`).then(r => r.json()),
                    fetch(`${baseUrl}/EstadosCitas`).then(r => r.json()), // Petición al nuevo endpoint
                ]);

                setCatalogos({
                    generos: gen,
                    tiposDocumento: doc,
                    tiposSangre: san,
                    estadosCiviles: civ,
                    especialidades: esp,
                    categoriasTerapias: cat,
                    estadosCitas: est // Guardamos los estados de cita
                });
            } catch (error) {
                console.error("Error cargando catálogos:", error);
            }
        };

        cargarDatos();
    }, []);

    return catalogos;
};