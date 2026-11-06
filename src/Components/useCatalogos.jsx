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
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5298/api';
            const baseUrl = `${API_URL}/Catalogos`;
            
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };
            
            try {
                const [gen, doc, san, civ, esp, cat, est] = await Promise.all([
                    fetch(`${baseUrl}/Generos`, { headers }).then(r => r.json()),
                    fetch(`${baseUrl}/TiposDocumento`, { headers }).then(r => r.json()),
                    fetch(`${baseUrl}/TiposSangre`, { headers }).then(r => r.json()),
                    fetch(`${baseUrl}/EstadosCiviles`, { headers }).then(r => r.json()),
                    fetch(`${baseUrl}/Especialidades`, { headers }).then(r => r.json()),
                    fetch(`${baseUrl}/CategoriasTerapias`, { headers }).then(r => r.json()),
                    fetch(`${baseUrl}/EstadosCitas`, { headers }).then(r => r.json()),
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