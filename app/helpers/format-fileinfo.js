import { helper } from 'ember-helper';

function format([ type ]) {
  switch (type.toLowerCase()) {
    case "png": case "jpg": case "jpeg": case "bmp": case "gif": case "pcx":
      return "Image";
    case "pdf":
      return "PDF document";
    case "x-zip-compressed": case "rar": case "x-gzip": case "gzip": case "x-tar": case "7z": case "arj":
      return "Compressed archive"
    case 'html': case 'htm':
      return "HTML document";
    case "msword": case "vnd.openxmlformats-officedocument.wordprocessingml.document":
      return "Word document";
    case "vnd.ms-excel": case "vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return "Excel spreadsheet";
    case "avi": case "mpg":case "mpeg":case "mkv":
      return "Video";
    case "vnd.ms-powerpoint": case "vnd.openxmlformats-officedocument.presentationml.presentation":
      return "PowerPoint presentation";
    default:
      return type;
  }
}

export default helper(format);
