from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter
from opentelemetry.sdk.resources import Resource

def setup_tracer():
    """
    Configure OpenTelemetry tracer for the FreshMart Retention system.
    Sets up a global TracerProvider with ConsoleSpanExporter.
    
    Fallback to Console since Docker/Jaeger is not available.
    """
    # Create Resource to identify the service
    resource = Resource.create({
        "service.name": "freshmart-retention",
        "service.version": "1.0.0"
    })

    # Initialize TracerProvider
    provider = TracerProvider(resource=resource)

    # Configure ConsoleSpanExporter to output traces to stdout
    processor = BatchSpanProcessor(ConsoleSpanExporter())
    provider.add_span_processor(processor)

    # Set as global TracerProvider
    trace.set_tracer_provider(provider)
