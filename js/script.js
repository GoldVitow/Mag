window.addEventListener('DOMContentLoaded', () => {
  const uploadInput = document.getElementById('upload');
  const previewImage = document.getElementById('preview');
  const previewHeading = document.getElementById('preview-heading');
  const programBtn = document.querySelector('.button');


  uploadInput.addEventListener('change', () => {
    const file = uploadInput.files[0];
    const reader = new FileReader();

    reader.addEventListener('load', () => {
      previewImage.src = reader.result;
      previewImage.style.display = 'block';
      previewHeading.style.display = 'block';
      programBtn.style.display = 'block';
    });

    if (file) {
      reader.readAsDataURL(file);
    }
  });
});









document.querySelector('.button').addEventListener('click', function (e) {
  e.preventDefault();



  mainFunction();

  async function mainFunction() {
    await animationFunction();
    setTimeout(function () {
      clasificator();
      document.getElementById('downloadButton').style.display = 'block';
    }, 1000);

  }

  function animationFunction() {
    return new Promise(function (resolve) {
      document.querySelector('.button').textContent = 'ВЫПОЛНЯЕТСЯ';
      resolve();
    })

  }

  function clasificator() {
    const resultHeading = document.getElementById('result-heading');
    resultHeading.style.display = 'block';

    // Функция для кластеризации изображения методом k-средних
    function clusterImage(imageData, k) {
      const data = imageData.data;
      const pixels = [];

      // Преобразование пикселей изображения в векторы
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        pixels.push([r, g, b]);
      }

      // Функция для вычисления Евклидова расстояния между двумя векторами
      function euclideanDistance(a, b) {
        let sum = 0;
        for (let i = 0; i < a.length; i++) {
          sum += Math.pow(a[i] - b[i], 2);
        }
        return Math.sqrt(sum);
      }

      // Инициализация центроидов кластеров
      const centroids = pixels.slice(0, k);

      // Основной цикл алгоритма k-средних
      let iterations = 0;
      let clusters; // Объявление переменной clusters
      while (true) {
        clusters = new Array(k).fill().map(() => []);

        // Присвоение каждого пикселя к ближайшему центроиду
        for (const pixel of pixels) {
          let minDistance = Infinity;
          let closestCentroidIndex = 0;

          for (let i = 0; i < centroids.length; i++) {
            const distance = euclideanDistance(pixel, centroids[i]);
            if (distance < minDistance) {
              minDistance = distance;
              closestCentroidIndex = i;
            }
          }

          clusters[closestCentroidIndex].push(pixel);
        }

        // Пересчет центроидов кластеров
        let convergence = true;
        for (let i = 0; i < k; i++) {
          const cluster = clusters[i];
          const clusterSize = cluster.length;

          if (clusterSize === 0) {
            continue;
          }

          const centroidSum = new Array(3).fill(0);
          for (const pixel of cluster) {
            for (let j = 0; j < 3; j++) {
              centroidSum[j] += pixel[j];
            }
          }

          const newCentroid = centroidSum.map(sum => Math.round(sum / clusterSize));

          if (!newCentroid.every((value, index) => value === centroids[i][index])) {
            convergence = false;
          }

          centroids[i] = newCentroid;
        }

        iterations++;

        if (convergence) {
          break;
        }
      }

      // Создание нового изображения с цветами кластеров
      const newImageData = new ImageData(imageData.width, imageData.height);
      const newData = newImageData.data;

      for (let i = 0, j = 0; i < pixels.length; i++) {
        const centroidIndex = clusters.findIndex(cluster => cluster.includes(pixels[i]));

        newData[j++] = centroids[centroidIndex][0];
        newData[j++] = centroids[centroidIndex][1];
        newData[j++] = centroids[centroidIndex][2];
        newData[j++] = 255;
      }

      return newImageData;
    }

    // Получение элементов DOM
    const originalImage = document.querySelector('.img');
    const clusteredImageCanvas = document.getElementById('clusteredImageCanvas');
    const clusteredImageContext = clusteredImageCanvas.getContext('2d');

    // Ожидание загрузки изображения
    // originalImage.onload = () => {
    const canvasWidth = originalImage.width;
    const canvasHeight = originalImage.height;

    clusteredImageCanvas.width = canvasWidth;
    clusteredImageCanvas.height = canvasHeight;

    clusteredImageContext.drawImage(originalImage, 0, 0);

    const imageData = clusteredImageContext.getImageData(0, 0, canvasWidth, canvasHeight);

    // Кластеризация изображения с использованием k-средних (пример: k = 4)
    const k = 4;
    const clusteredImageData = clusterImage(imageData, k);

    clusteredImageContext.putImageData(clusteredImageData, 0, 0);
    // };

    document.querySelector('.button').style.display = 'none';
    document.querySelector('.done').style.display = 'block';
    document.querySelector('.preview-block').style.marginRight = '30px';
    document.querySelector('.result-block').style.display = 'block';
  }



});






const canvas = document.getElementById('clusteredImageCanvas');

// Получаем ссылку на кнопку, которая будет запускать скачивание
const downloadButton = document.getElementById('downloadButton');

// Создаем функцию, которая будет обрабатывать клик по кнопке скачивания
function downloadImage(e) {
  e.preventDefault();
  // Получаем ссылку на изображение в формате PNG
  const imageData = canvas.toDataURL('image/png');

  // Создаем временную ссылку для загрузки
  const link = document.createElement('a');
  link.href = imageData;
  link.download = 'clustered_image.png';

  // Программно кликаем по ссылке для скачивания
  link.click();
}

// Добавляем обработчик события на клик по кнопке скачивания
downloadButton.addEventListener('click', downloadImage);


