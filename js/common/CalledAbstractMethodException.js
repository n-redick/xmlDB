function CalledAbstractMethodException ( className, methodName ) {
	Error.call( this, "Called abstract method " + className + "::" + methodName );
}

CalledAbstractMethodException.prototype = new Error();