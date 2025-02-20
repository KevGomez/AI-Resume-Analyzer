from marshmallow import Schema, fields, validate, ValidationError as MarshmallowValidationError
from .errors import ValidationError

class ResumeSchema(Schema):
    file_name = fields.Str(required=True)
    file_type = fields.Str(validate=validate.OneOf(['PDF', 'DOCX']))
    content = fields.Str()
    extracted_text = fields.Str()

class ChatQuestionSchema(Schema):
    question = fields.Str(required=True, validate=validate.Length(min=1))

def validate_request(schema_class, data):
    """Validate request data against a schema"""
    try:
        schema = schema_class()
        return schema.load(data)
    except MarshmallowValidationError as e:
        raise ValidationError('Invalid request data', payload={'errors': e.messages})

def validate_file_type(file):
    """Validate uploaded file type"""
    allowed_extensions = {'pdf', 'docx'}
    if '.' not in file.filename:
        raise ValidationError('No file extension')
    if file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
        raise ValidationError('Invalid file type. Only PDF and DOCX files are allowed') 