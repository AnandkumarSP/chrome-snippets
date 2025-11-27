function fastagStrToArr(x) {
    const strToCopy = x
        .split('\n')
        .map(x => x.split(' '))
        .map(x => {
            const transDate = `${x.shift()} ${x.shift()}`;
            const timeProcessed = `${x.shift()} ${x.shift()}`;
            const licensePlateNo = x.shift();
            const amount = x.pop();
            const transactionId = [x.pop(), x.pop(), x.pop()].reverse().join(' ');
            return [transDate, timeProcessed, licensePlateNo, x.join(' '), transactionId, amount].join('\t');
        })
        .join('\n');

    copy(strToCopy);
}
