const parseJSON = (jsonString) => {
  try {
      return JSON.parse(jsonString);
  } catch (e) {
      throw new Error('Invalid JSON format');
  }
};

const decodeBaseValue = (base, value) => {
  if (isNaN(parseInt(base))) throw new Error(`Invalid base: ${base}`);
  return parseInt(value, parseInt(base));
};

const gaussElimination = (matrix, b) => {
  const n = matrix.length;

  // Forward elimination
  for (let i = 0; i < n; i++) {
      // Pivoting: Find the maximum element in this column
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
          if (Math.abs(matrix[k][i]) > Math.abs(matrix[maxRow][i])) {
              maxRow = k;
          }
      }

      // Swap rows
      [matrix[i], matrix[maxRow]] = [matrix[maxRow], matrix[i]];
      [b[i], b[maxRow]] = [b[maxRow], b[i]];

      // Eliminate column entries
      for (let k = i + 1; k < n; k++) {
          const factor = matrix[k][i] / matrix[i][i];
          for (let j = i; j < n; j++) {
              matrix[k][j] -= factor * matrix[i][j];
          }
          b[k] -= factor * b[i];
      }
  }

  // Back substitution
  const x = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
      x[i] = b[i] / matrix[i][i];
      for (let k = i - 1; k >= 0; k--) {
          b[k] -= matrix[k][i] * x[i];
      }
  }

  return x;
};


const buildMatrix = (points, n) => {
  const matrix = [];
  const b = [];

  for (let i = 0; i < n; i++) {
      const row = [];
      for (let j = 0; j < n; j++) {
          row.push(Math.pow(points[i].x, j));
      }
      matrix.push(row);
      b.push(points[i].y);
  }

  return { matrix, b };
};

const findConstantTerm = (jsonString) => {
  const data = parseJSON(jsonString);

  const { n } = data.keys;
  const points = [];

  // Decode the points
  for (let key in data) {
      if (key === 'keys') continue;

      const base = data[key].base;
      const value = data[key].value;
      const x = parseInt(key, 10);
      const y = decodeBaseValue(base, value);

      points.push({ x, y });
  }

  // Construct the matrix for polynomial fitting
  const { matrix, b } = buildMatrix(points, n);

  // Perform Gauss Elimination
  const solution = gaussElimination(matrix, b);

  // Return the constant term a_0
  return solution[0];
};

// Example JSON input as a string
const jsonString = JSON.stringify({
  "keys": {
      "n": 4,
      "k": 3
  },
  "1": {
      "base": "10",
      "value": "4"
  },
  "2": {
      "base": "2",
      "value": "111"
  },
  "3": {
      "base": "10",
      "value": "12"
  },
  "6": {
      "base": "4",
      "value": "213"
  }
});

console.log(findConstantTerm(jsonString)); // Output the constant term
