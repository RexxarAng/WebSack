const fs = require('fs');
const Terser = require('terser');
const glob = require('glob');

const options = {
  // mangle: true,
  compress: true,
  output: {
    comments: false,
  },
};

const files = [
  'src/**/*.ts',
];

files.forEach(filePattern => {
  const files = glob.sync(filePattern);

  files.forEach(file => {
    const code = fs.readFileSync(file, 'utf8');
    console.log(code); // tshoot
    const result = Terser.minify(code, options);

    if (result.error) {
      console.error(`Error obfuscating ${file}:`, result.error);
      return;
    }
    console.log(result.code); // tshoot
    fs.writeFileSync(file, result.code, 'utf8');
  });
});
