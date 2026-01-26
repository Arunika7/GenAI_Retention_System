import logging
import sys

def get_logger(name: str) -> logging.Logger:
    """
    Get a configured logger instance for the FreshMart retention system.
    
    Args:
        name (str): The name of the module/component (usually __name__).
        
    Returns:
        logging.Logger: Configured logger instance.
    """
    logger = logging.getLogger(name)
    
    # Configure logger if it doesn't have handlers
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        
        # Create console handler (stdout)
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(logging.INFO)
        
        # Define format with timestamp and log level
        formatter = logging.Formatter(
            '%(asctime)s - %(levelname)s - %(name)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        handler.setFormatter(formatter)
        
        logger.addHandler(handler)
        
        # Prevent propagation to root logger to avoid duplicate logs
        # if root logger is also configured (e.g. by uvicorn)
        logger.propagate = False
        
    return logger
