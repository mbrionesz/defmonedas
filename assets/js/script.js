document.addEventListener('DOMContentLoaded', function () {
  const seleccionMoneda = document.getElementById('seleccionMoneda');
  const btnBuscar = document.getElementById('btnBuscar');
  const inputCLP = document.getElementById('cantidadCLP');
  const resultadoDiv = document.getElementById('resultadoConversion');

  let myChart = null; // Variable global para mantener la referencia al gráfico

  // Cargar 'Dólar', 'UF', 'Euro', 'Bitcoin' al cargar la página
  cargarMonedas(['dolar', 'uf', 'euro', 'bitcoin',]);

  btnBuscar.addEventListener('click', function () {
      const cantidadCLP = parseFloat(inputCLP.value);
      const monedaSeleccionada = seleccionMoneda.value;
      if (!isNaN(cantidadCLP) && monedaSeleccionada) {
          convertirMoneda(cantidadCLP, monedaSeleccionada);
      } else {
          resultadoDiv.textContent = 'Por favor, ingresa una cantidad y selecciona una moneda.';
      }
  });

  function cargarMonedas(monedas) {
      monedas.forEach(codigoMoneda => {
          const option = document.createElement('option');
          option.value = codigoMoneda;
          option.textContent = codigoMoneda.charAt(0).toUpperCase() + codigoMoneda.slice(1).toLowerCase();
          seleccionMoneda.appendChild(option);
      });
  }

  async function convertirMoneda(cantidad, codigoMoneda) {
      try {
          const response = await fetch('https://mindicador.cl/api');  // API general que contiene varios indicadores
          if (!response.ok) throw new Error('Error al realizar la solicitud');
          const nohayplata = await response.json();

          let valorConversion;
          switch (codigoMoneda) {
              case 'dolar':
                  valorConversion = nohayplata.dolar.valor;
                  break;
              case 'uf':
                  valorConversion = nohayplata.uf.valor;
                  break;
              case 'euro':
                  valorConversion = nohayplata.euro.valor;
                  break;
              case 'bitcoin':
                  valorConversion = nohayplata.bitcoin.valor;
                  break;
              default:
                  throw new Error('Moneda no soportada');
          }

          const resultado = cantidad / valorConversion;
          resultadoDiv.textContent = `Resultado: ${resultado.toFixed(2)} ${codigoMoneda.charAt(0).toUpperCase() + codigoMoneda.slice(1).toLowerCase()}`;

          // Muestra el gráfico después de obtener el resultado
          obtenerDatosParaGrafico(codigoMoneda);
      } catch (error) {
          console.error('Hubo un error al convertir la moneda: ', error);
          resultadoDiv.textContent = 'Hubo un error al realizar la conversión.';
      }
  }

  async function obtenerDatosParaGrafico(codigoMoneda) {
      try {
          const url = `https://mindicador.cl/api/${codigoMoneda}`;  //Con el ${codigoMoneda} busca la API mensual ya sea del Dolar, Euro, bitcoin... del cargarMonedas, como origen.
          const response = await fetch(url);
          if (!response.ok) throw new Error('Error al realizar la solicitud');
          const data = await response.json();
          const ultimosDiezDias = data.serie.slice(0, 10);
          crearGrafico(ultimosDiezDias, codigoMoneda);
      } catch (error) {
          console.error('Error al obtener los datos para el gráfico:', error);
      }
  }

  function crearGrafico(datos, codigoMoneda) {
      const fechas = datos.map(dato => new Date(dato.fecha).toLocaleDateString());
      const valores = datos.map(dato => dato.valor);
  
      const ctx = document.getElementById('myChart').getContext('2d');
  
      if (myChart) {
          // Actualizar los datos del gráfico existente
          myChart.data.labels = fechas;
          myChart.data.datasets[0].data = valores;
          myChart.data.datasets[0].label = `Valor del ${codigoMoneda.charAt(0).toUpperCase() + codigoMoneda.slice(1).toLowerCase()}`;
          myChart.update();
      } else {
          // Crear un nuevo gráfico
          myChart = new Chart(ctx, {
              type: 'line',
              data: {
                  labels: fechas,
                  datasets: [{
                      label: `Valor del ${codigoMoneda.charAt(0).toUpperCase() + codigoMoneda.slice(1).toLowerCase()}`,
                      data: valores,
                      backgroundColor: 'rgba(0, 123, 255, 0.5)',
                      borderColor: 'rgba(0, 123, 255, 1)',
                      borderWidth: 1
                  }]
              },
              options: {
                  scales: {
                      yAxes: [{
                          ticks: {
                              beginAtZero: false
                          }
                      }]
                  }
              }
          });
      }
  }    
});
  
  