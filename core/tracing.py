from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter
from opentelemetry.sdk.resources import Resource

def setup_tracing():
    """
    Configure OpenTelemetry tracing for the application.
    Sets up a TracerProvider with a ConsoleSpanExporter.
    """
    # Create a Resource to identify the service
    resource = Resource.create({
        "service.name": "freshmart-retention-api",
        "service.version": "1.0.0"
    })

    # Initialize the TracerProvider
    provider = TracerProvider(resource=resource)

    # Configure the ConsoleSpanExporter to print spans to stdout
    # Using BatchSpanProcessor for better performance
    processor = BatchSpanProcessor(ConsoleSpanExporter())
    provider.add_span_processor(processor)

    # Set the global TracerProvider
    trace.set_tracer_provider(provider)
