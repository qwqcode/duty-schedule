<?php
initDataFile();
tokenCheck(DataArr['token']);

$actions = [
  'download' => function () {
    success(['data' => DataArr['data']]);
  },
  'upload' => function () {
    if (empty($data = trim($_POST['data'] ?? $_GET['data'] ?? ''))) {
      error(['msg' => 'data cannot be empty.']);
    }
    file_put_contents(DataFile, getDataFileCode(array_merge(DataArr, ['data' => $data])));
    success();
  },
];

if (!empty($_GET['op']) && !empty($actions[$_GET['op']])) {
  $actions[$_GET['op']]();
} else {
  error(['msg' => '????']);
}

function initDataFile() {
  define('DataFile', __dir__ . '/data.php');
  if (!file_exists(DataFile)) {
    file_put_contents(DataFile, getDataFileCode(['token' => '233', 'data' => '']));
  }
  define('DataArr', require(DataFile));
}

function getDataFileCode(array $data = []) {
  return '<?php return '.var_export($data, true).';';
}

function tokenCheck($token = '') {
  if (empty($_GET['token']) || trim($_GET['token']) !== $token) {
    error(['msg' => 'token 不正确']);
  }
}

function success(array $data = []) {
  header('Content-type: application/json');
  exit(json_encode(array_merge(['success' => true], $data)));
}

function error(array $data = []) {
  header('Content-type: application/json');
  exit(json_encode(array_merge(['success' => false], $data)));
}
