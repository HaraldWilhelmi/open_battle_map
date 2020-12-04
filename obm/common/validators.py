def name_validator(name: str):
    if len(name) > 64:
        raise ValueError('Longer than 64 characters.')
    return name
