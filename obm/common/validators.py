from fastapi import HTTPException, status


def name_validator(name: str):
    if len(name) > 64:
        raise ValueError('Longer than 64 characters.')
    return name


def path_validator(name: str):
    if len(name) > 1024:
        raise ValueError('Longer than 1024 characters.')
    return name


_SUPPORTED_MEDIA_TYPES = {
    'image/png',
    'image/gif',
    'image/jpeg',
    'image/svg+xml',
}


def image_media_type_validator(media_type: str):
    if media_type not in _SUPPORTED_MEDIA_TYPES:
        raise HTTPException(
            status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            'Unsupported media type for images.'
        )
