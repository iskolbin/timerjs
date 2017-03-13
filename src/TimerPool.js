class Timer {
	constructor( callback, delay, args, interval ) {
		this.callback = callback
		this.delay = delay
		this.args = args
		this.interval = interval
	}
}

export default class TimerPool {
	constructor( clock = 0.0 ) {
		this.clock = clock
		this.timers = new Array()
		this.priorities = new Array()
		this.indices = new Map()
	}

	setTimeout( f, delay, ...args ) {
		return enqueueTimer( this, new Timer( f, delay, args, false ))
	}

	setInterval( f, delay, ...args ) {
		return enqueueTimer( this, new Timer( f, delay, args, true ))
	}

	clearTimeout( timer ) {
		return removeTimer( this, timer )
	}

	clearInterval( timer ) {
		return removeTimer( this, timer )
	}

	update( clock ) {
		this.clock = clock
		while ( this.size > 0 && this.priorities[0] <= clock ) {
			const timer = dequeueTimer( this )
			const {f,delay,args,interval} = timer
			f.apply( this, args )
			if ( interval ) {
				enqueueTimer( this, timer, this.priorities[0] + delay )
			}
		}
	}

	reset( clock ) {
		const dt = clock - this.clock
		this.clock = clock
		for ( i = 0; i < this.size; i++ ) {
			this.priorities[i] += dt
		}
	}

	get size() {
		return this.priorities.length
	}
}

const enqueueTimer = ( this, timer, clock ) => {
	const index = this.size
	this.timers.push( timer )
	this.priorities.push( clock )
	this.indices.set( timer, index )
	siftUp( this, index )
	return timer
}

const dequeueTimer = ( this ) => {
	const timer = this.timers[0]
	this.indices.delete( timer )
	if ( this.size > 1 ) {
		this.timers[0] = timers.pop()
		this.priorities[0] = priorities.pop()
		this.indices.set( timers[0], 0 )
		siftDown( this, 0 )
	} else {
		this.timers.pop()
		this.priorities.pop()
	}
	return timer
}

const removeTimer = ( this, timer ) => {
	const index = this.indices.get( timer )
	if ( index !== undefined ) {
		const timers = this.timers
		const priorities = this.priorities
		const indices = this.indices
		indices.delete( timer )
		if ( index == this.size-1 ) {
			timers.pop()
			priorities.pop()
		} else {
			timers[index] = timers.pop()
			priorities[index] = priorities.pop()
			indices.set( timers[index], index )
			if ( this.size > 1 ) {
				siftDown( this, siftUp( this, index ))
			}
		}
		return true
	} else {
		return false
	}
}

const siftUp = ( this, from ) => {
	let index = from
	let parentIndex = index >> 1
	while (index > 0 && priorities[parentIndex] > priorities[index]) {
		swap( this, index, parentIndex )
		index = parentIndex
		parentIndex = parentIndex >> 1
	}
	return index
}

const siftDown = ( this, limit ) => {
	const size = this.size
	const priorities = this.priorities
	for ( let index = limit-1; index >= 0; i-- ) {
		let leftIndex = index + index
		let rightIndex = leftIndex + 1
		while (leftIndex < size) {
			let smaller = leftIndex
			if (rightIndex < size && priorities[leftIndex] > priorities[rightIndex]) {
				smaller = rightIndex
			}
			if ( priorities[index] > priorities[smaller] ) {
				swap( this, index, smaller )
			} else {
				break
			}
			index = smaller
			leftIndex = index + index
			rightIndex = leftIndex + 1
		}
	}
}

const swap( this, i, j ) => {
	const tempTimer = this.timers[i]
	const tempPriority = this.priorities[i]
	this.timers[i] = this.timers[j]
	this.priorities[i] = this.priorities[j]
	this.indices.set( this.timers[i], i )
	this.timers[j] = tempTimer
	this.priorities[j] = tempPriority
	this.indices.set( tempTimer, j )
}
