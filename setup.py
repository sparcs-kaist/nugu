from setuptools import setup


setup(
    name='nugu',

    # Versions should comply with PEP440.  For a discussion on single-sourcing
    # the version across setup.py and the project code, see
    # https://packaging.python.org/en/latest/single_source_version.html
    version='0.1.0',
    description='Nugu',
    long_description='SPARCS Nugu Manager',
    url='https://github.com/sparcs-kaist/nugu',
    author='SPARCS Wheel',
    author_email='samjo@sparcs.org',
    license='',
    classifiers=[
        'Development Status :: 4 - Beta',
        'Intended Audience :: Developers',
        'Programming Language :: Python',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.5',
        'Operating System :: POSIX',
        'Operating System :: MacOS :: MacOS X',
        'Environment :: No Input/Output (Daemon)',
        'Topic :: Software Development',
    ],

    packages=['nugu'],

    python_requires='>=3.5.2',
    install_requires=[
        'pep8==1.7.0',
        'requests==2.11.1',
        'slacker==0.9.28',
        'SQLAlchemy==1.1.2',
        'websockets==3.2',
    ],
    extras_require={
        'dev': ['pytest', 'flake8', 'pep8-naming'],
        'test': ['pytest'],
    },
    package_data={
    },
    data_files=[],
)
