"""
Centralized logging configuration for the application.
"""

import logging
import sys
from logging.handlers import RotatingFileHandler

LOG_FILE = "app.log"
LOG_MAX_BYTES = 5 * 1024 * 1024  # 5 MB
LOG_BACKUP_COUNT = 3


def setup_logging():
    """
    Configure logging for the application with a custom format.
    Should be called once at application startup.

    Logs are written to both stdout and a rotating log file (app.log).
    The log file rotates at 5 MB and keeps up to 3 backup files.
    """
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s: %(message)s"
    )

    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.setFormatter(formatter)

    file_handler = RotatingFileHandler(
        LOG_FILE, maxBytes=LOG_MAX_BYTES, backupCount=LOG_BACKUP_COUNT
    )
    file_handler.setFormatter(formatter)

    logging.basicConfig(
        level=logging.INFO,
        handlers=[stream_handler, file_handler],
    )


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance for the given module name.

    Args:
        name: The name of the module (typically __name__)

    Returns:
        A configured logger instance
    """
    return logging.getLogger(name)
