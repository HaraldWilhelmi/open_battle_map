import logging


class OurLogger:
    logger = None

    @classmethod
    def get_logger(cls):
        if cls.logger is None:
            cls.logger = logging.getLogger('obm')
            cls.logger.setLevel(logging.INFO)
            console_handler = logging.StreamHandler()
            console_handler.setLevel(logging.INFO)
            cls.logger.addHandler(console_handler)
        return cls.logger


def info(message):
    OurLogger.get_logger().info(message)


def warning(message):
    OurLogger.get_logger().warning(message)


def error(message):
    OurLogger.get_logger().error(message)
